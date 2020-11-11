enum Constants {
  READYOK = 'readyok',
  INFINITE = 'infinite',
  STARTPOS = 'startpos',
  UCIOK = 'uciok',
  BESTMOVE = 'bestmove',
  NONEMOVE = '(none)',
}

const uciokRegExp = new RegExp(Constants.UCIOK)
const readyokRegExp = new RegExp(Constants.READYOK)
const bestMoveRegExp = new RegExp(Constants.BESTMOVE)

const Regex = {
  uciok: uciokRegExp,
  readyok: readyokRegExp,
  bestMove: bestMoveRegExp,
}

export { Constants, Regex }
