enum StockfishOptionKey {
  threads = 'Threads',
  hash = 'Hash',
  ponder = 'Ponder',
  multiPV = 'MultiPV',
  useNNUE = 'Use NNUE',
  evalFile = 'EvalFile',
  uciAnalyseMode = 'UCI_AnalyseMode',
  uciChess960 = 'UCI_Chess960',
  uciShowWDL = 'UCI_ShowWDL',
  uciLimitStrength = 'UCI_LimitStrength',
  uciElo = 'UCI_Elo',
  skillLevel = 'Skill Level',
  syzygyPath = 'SyzygyPath',
  syzygyProbeDepth = 'SyzygyProbeDepth',
  syzygy50MoveRule = 'Syzygy50MoveRule',
  syzygyProbeLimit = 'SyzygyProbeLimit',
  contempt = 'Contempt',
  analysisContempt = 'Analysis Contempt',
  moveOverhead = 'Move Overhead',
  slowMover = 'Slow Mover',
  nodestime = 'nodestime',
  clearHash = 'Clear Hash',
  debugLogFile = 'Debug Log File',
}

enum AnalysisContempt {
  both = 'Both',
  white = 'White',
  black = 'Black',
  off = 'Off',
}

interface StockfishOptions {
  [StockfishOptionKey.threads]: number
  [StockfishOptionKey.hash]: number
  [StockfishOptionKey.ponder]: boolean
  [StockfishOptionKey.multiPV]: number
  [StockfishOptionKey.useNNUE]: boolean
  [StockfishOptionKey.evalFile]: string
  [StockfishOptionKey.uciAnalyseMode]: boolean
  [StockfishOptionKey.uciChess960]: boolean
  [StockfishOptionKey.uciShowWDL]: boolean
  [StockfishOptionKey.uciLimitStrength]: boolean
  [StockfishOptionKey.uciElo]: number
  [StockfishOptionKey.skillLevel]: number
  [StockfishOptionKey.syzygyPath]: string
  [StockfishOptionKey.syzygyProbeDepth]: number
  [StockfishOptionKey.syzygy50MoveRule]: boolean
  [StockfishOptionKey.syzygyProbeLimit]: number
  [StockfishOptionKey.contempt]: number
  [StockfishOptionKey.analysisContempt]: AnalysisContempt
  [StockfishOptionKey.moveOverhead]: number
  [StockfishOptionKey.slowMover]: number
  [StockfishOptionKey.nodestime]: number
  [StockfishOptionKey.clearHash]: null
  [StockfishOptionKey.debugLogFile]: string
}

const defaultOptions: StockfishOptions = {
  [StockfishOptionKey.threads]: 1,
  [StockfishOptionKey.hash]: 16,
  [StockfishOptionKey.ponder]: false,
  [StockfishOptionKey.multiPV]: 1,
  [StockfishOptionKey.useNNUE]: true,
  [StockfishOptionKey.evalFile]: '',
  [StockfishOptionKey.uciAnalyseMode]: false,
  [StockfishOptionKey.uciChess960]: false,
  [StockfishOptionKey.uciShowWDL]: false,
  [StockfishOptionKey.uciLimitStrength]: false,
  [StockfishOptionKey.uciElo]: 1350,
  [StockfishOptionKey.skillLevel]: 20,
  [StockfishOptionKey.syzygyPath]: '',
  [StockfishOptionKey.syzygyProbeDepth]: 1,
  [StockfishOptionKey.syzygy50MoveRule]: true,
  [StockfishOptionKey.syzygyProbeLimit]: 7,
  [StockfishOptionKey.contempt]: 24,
  [StockfishOptionKey.analysisContempt]: AnalysisContempt.both,
  [StockfishOptionKey.moveOverhead]: 10,
  [StockfishOptionKey.slowMover]: 100,
  [StockfishOptionKey.nodestime]: 0,
  [StockfishOptionKey.clearHash]: null,
  [StockfishOptionKey.debugLogFile]: '',
}

export { StockfishOptionKey, StockfishOptions, defaultOptions }
