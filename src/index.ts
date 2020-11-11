import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { createInterface } from 'readline'
import { Script } from 'vm'

import {
  StockfishCommand,
  Constants,
  CommandOptions,
  defaultCommandOptions,
  StockfishOptionKey,
  StockfishOptions,
  Params,
  Regex,
  defaultOptions,
} from './service'

import { asynchronous } from './utils'

const rl = createInterface({ input: process.stdin, output: process.stdout })

const input = (question: string = '') =>
  new Promise<string>((resolve, reject) => {
    rl.question(question, (answer) => resolve(answer))
  })

const defaultStockfishPath = 'stockfish'

class Stockfish {
  private readonly child: ChildProcessWithoutNullStreams

  private constructor(path: string) {
    this.child = spawn(path)
    this.child.stdout.setEncoding('utf-8')
  }

  public static init = async (
    path = defaultStockfishPath,
    options: Partial<StockfishOptions> = {}
  ) => {
    const instance = new Stockfish(path)
    await instance.read()
    await instance.uci()
    await instance.waitForReady()

    await instance.newGame()

    options = { ...defaultOptions, ...options }

    for (const key in options) {
      await instance.setOption(
        key as StockfishOptionKey,
        options[key as StockfishOptionKey]
      )
    }

    await instance.read()
    return instance
  }

  private put = async (command: string | Buffer) => {
    if (command instanceof Buffer) {
      command = command.toString()
    }
    this.child.stdin.write(Buffer.from(`${command}\n`))
  }

  private _readOnce = (delay?: number) =>
    asynchronous((): string | null => {
      const message = this.child.stdout.read()

      if (!message) {
        return message
      }
      return message instanceof Buffer ? message.toString() : String(message)
    }, delay)

  private _readTimer = async (timer = 10) => {
    let result = ''
    let output: string | null = null

    do {
      output = await this._readOnce(timer)
      if (output) {
        result += output
      }
    } while (!!output)

    return result ? result.trim() : null
  }

  private _readUntil = async (condition: (resp: string) => boolean) => {
    let result = ''
    let resolveListener: ((chunk: string) => void) | null = null

    let rejectListener: ((reason: unknown) => void) | null = null

    const detachListeners = () => {
      resolveListener &&
        this.child.stdout.removeListener('data', resolveListener)
      rejectListener && this.child.removeListener('error', rejectListener)
      rejectListener && this.child.removeListener('close', rejectListener)
    }

    await new Promise((resolve, reject) => {
      rejectListener = reject

      resolveListener = (chunk: string) => {
        result = `${result}${chunk}`
        if (condition(result)) {
          detachListeners()
          resolve()
        }
      }

      this.child.stdout.addListener('data', resolveListener)
      this.child.once('error', reject)
      this.child.once('close', reject)
    })
    detachListeners()

    return result
  }

  private read = async (end: number | ((res: string) => boolean) = 10) => {
    const result = await (typeof end === 'function'
      ? this._readUntil(end)
      : this._readTimer(end))
    return result?.trim() || null
  }

  private command = async (
    command: StockfishCommand,
    options: Partial<CommandOptions> = defaultCommandOptions
  ) => {
    const opts = { ...defaultCommandOptions, ...options } as CommandOptions
    const { params, end } = opts

    const commandMsg =
      params && params.length ? `${command} ${params.join(' ')}` : command
    await this.put(commandMsg)
    const response = await this.read(end)
    return response
  }

  public uci = async () =>
    await this.command(
      StockfishCommand.uci
      // { end: CommandEnd.uciEnd }
    )

  public isReady = async () =>
    (await this.command(StockfishCommand.isReady)) === Constants.READYOK

  private waitForReady = async () => {
    // await this.command(
    //   StockfishCommand.isReady
    //  {  end: CommandEnd.readyEnd,}
    // )

    while (!(await this.command(StockfishCommand.isReady)));

    return true
  }

  public newGame = async () => this.command(StockfishCommand.newGame)

  public board = async () => await this.command(StockfishCommand.board)

  public eval = async () => await this.command(StockfishCommand.eval)

  public setOption = async <T extends StockfishOptionKey>(
    option: StockfishOptionKey,
    value: StockfishOptions[T] | undefined
  ) => {
    if (value !== null && value !== '' && value !== undefined) {
      await this.command(StockfishCommand.setOption, {
        params: [`name ${option}`, `value ${value}`],
      })
    }
  }

  private static keyValToParam = <K extends string, V = unknown>(
    key: K,
    value: V
  ) =>
    typeof value === 'boolean' && value === true
      ? key
      : Array.isArray(value)
      ? `${key} ${value.join(' ')}`
      : `${key} ${value}`

  public go = async (parameters: Params.GoParams = {}, end: number = 100) => {
    const params = Object.keys(parameters).reduce((acc, key) => {
      const value = parameters[key as keyof Params.GoParams]
      const parameter = Stockfish.keyValToParam(key, value)
      return [...acc, parameter]
    }, [] as string[])
    return await this.command(StockfishCommand.go, { params, end })
  }

  public fen = async () => {
    const result = await this.command(StockfishCommand.board)
    if (!result) {
      return null
    }
    const fen = result
      .split('\n')
      .find((line) => /fen:/i.test(line))
      ?.replace(/fen:/gi, '')
      .trim()

    return fen || null
  }

  public position = async (parameters: Params.PositionParams = {}) => {
    const params = Object.keys(parameters).reduce((acc, key) => {
      const value = parameters[key as keyof Params.PositionParams]
      let parameter = ''

      switch (key as keyof Params.PositionParams) {
        case 'from': {
          parameter =
            value === Constants.STARTPOS
              ? Constants.STARTPOS
              : Stockfish.keyValToParam('fen', value)
          break
        }
        default: {
          parameter = Stockfish.keyValToParam(key, value)
        }
      }

      return [...acc, parameter]
    }, [] as string[])
    return await this.command(StockfishCommand.position, { params })
  }

  public ponderhit = async () => await this.command(StockfishCommand.ponderHit)

  public stop = async () => await this.command(StockfishCommand.stop)

  public bestMove = async (goParams: Params.GoParams = {}, goEnd = 100) => {
    const result = await this.go(goParams, goEnd)
    const bestLine = result
      ?.split('\n')
      .find((line) => Regex.bestMove.test(line))
      ?.trim()

    const bestMove = bestLine?.split(' ')[1]

    return bestMove === Constants.NONEMOVE || !bestMove ? null : bestMove
  }

  public move = async (move: string) => {
    const fen = await this.fen()
    if (!fen) {
      return null
    }
    return await this.position({ from: fen, moves: [move] })
  }

  public close = async () => {
    await this.command(StockfishCommand.quit)
    this.child.kill()
  }
}

const one = async () => {
  const a = await Stockfish.init(undefined, {
    'Skill Level': 10,
  })
  await a.setOption(StockfishOptionKey.multiPV, 12)
  const info = await a.go({
    depth: 11,
  })

  console.log('info\n', info)

  await a.close()
}

const two = async () => {
  const a = await Stockfish.init(undefined, {
    'Skill Level': 20,
  })
  const b = await Stockfish.init(undefined, {
    'Skill Level': 20,
  })

  const makeMove = async (move: string) => {
    const aM = a.move(move)
    const bM = b.move(move)
    await Promise.all([aM, bM])
  }

  await a.position({ from: Constants.STARTPOS })
  await b.position({ from: Constants.STARTPOS })

  console.log(1)
  while (true) {
    const aMove = await a.bestMove({ depth: 11 })
    if (!aMove) {
      break
    }
    await makeMove(aMove)

    const bMove = await b.bestMove({ depth: 11 })
    if (!bMove) {
      break
    }
    await makeMove(bMove)

    const board = await a.board()
    if (!board) {
      break
    }
    console.log('board', board)
  }

  const aC = a.close()
  const bC = b.close()
  await Promise.all([aC, bC])
}

const main = async () => {
  // await one()
  await two()
}

main()
