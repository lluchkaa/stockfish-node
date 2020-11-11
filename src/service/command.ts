import { Constants, Regex } from './constants'

enum StockfishCommand {
  uci = 'uci',
  isReady = 'isready',
  setOption = 'setoption',
  newGame = 'ucinewgame',
  board = 'd',
  eval = 'eval',
  position = 'position',
  go = 'go',
  stop = 'stop',
  ponderHit = 'ponderhit',
  quit = 'quit',
}

type CommandEndType = number | ((res: string) => boolean)

interface CommandOptions {
  params: string[]
  end: CommandEndType
}

const defaultCommandOptions: CommandOptions = {
  params: [],
  end: 10,
}

const uciEnd: CommandEndType = (res) => Regex.uciok.test(res)

const readyEnd: CommandEndType = (res) => Regex.readyok.test(res)

namespace Params {
  export interface GoParams {
    searchmoves?: string[]
    ponder?: true
    wtime?: number
    btime?: number
    winc?: number
    binc?: number
    movestogo?: number
    depth?: number
    nodes?: number
    mate?: true
    movetime?: number
    infinite?: true
  }

  export interface PositionParams {
    from?: Constants.STARTPOS | string
    moves?: string[]
  }
}

const CommandEnd = {
  uciEnd,
  readyEnd,
}

export {
  StockfishCommand,
  CommandOptions,
  defaultCommandOptions,
  CommandEnd,
  Params,
}
