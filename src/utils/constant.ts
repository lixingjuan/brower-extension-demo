/** 一些常量 */
import { cwd } from "process";

/** 项目根目录 */
export const rootPath = cwd();

/** 请求地址到响应json的映射文件地址 */
export const pathToFileMapPath = `${rootPath}/page/map.json`;

/** respnse json base file path */
export const responseBasePath = `${rootPath}/response`;
