import { parseBinaryLog } from "./src/fsInteraction";
import mineFromAbstraction from "./src/mining";
import init from "./init";

init();

const logPath = "path to some binary log";
const { trainingLog, testLog, gtLog } = parseBinaryLog(logPath);

const model = mineFromAbstraction(trainingLog);
