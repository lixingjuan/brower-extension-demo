import Koa from 'koa';
import jsonfile from 'jsonfile';

import proxyRoute from './proxyService';
import { happyServiceFlag } from './constant';
import happyServiceApi from './happyService';
import {
  validateUrl,
  getRelationMap,
  saveResponseToLocalNew,
  getCompleteRequestUrl
} from './utils';

const routeMiddleWare = (ctx: Koa.Context) => {
  const { url, method, body } = ctx.request;
  // 接口合法性校验
  if (!validateUrl(url)) {
    return (ctx.body = {
      message: 'happy-proxy Service报错: errorMsg: completeUrl获取失败'
    });
  }

  // 1. 本服务自己的请求
  if (url.includes(happyServiceFlag)) {
    return happyServiceApi(ctx.request)
      .then((res) => {
        ctx.body = res;
      })
      .catch((err) => {
        console.log('读取本地内容出错', err.message);
      });
  }

  // 2. 本地有该接口的mock-data, 则读取本地mock-data返回前端
  const localUrlToFilePostionMap = getRelationMap();
  const completeUrl = getCompleteRequestUrl(url);
  const localFilePath = localUrlToFilePostionMap[completeUrl];
  if (localFilePath) {
    const content = jsonfile.readFileSync(localFilePath);
    ctx.body = content?.response;
    return;
  }

  // 3. 接口响应
  return proxyRoute(ctx.request, completeUrl)
    .then((res) => {
      saveResponseToLocalNew(completeUrl, {
        response: res,
        method: method,
        payload: body,
        proxyUrl: completeUrl
      });
      ctx.body = res;
    })
    .catch((err) => {
      ctx.body = {
        message: `happy-proxy Service报错: errorMsg: 请求真实接口失败，原因: ${err.message}`
      };
    });
};

export default routeMiddleWare;
