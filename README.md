# npm-command-call [![CircleCI](https://circleci.com/gh/lancewuz/npm-command-call.svg?style=svg)](https://circleci.com/gh/lancewuz/npm-command-call) [![npm version](https://img.shields.io/npm/v/npm-command-call.svg?style=flat)](https://www.npmjs.com/package/npm-command-call)

以函数调用的方式使用npm cli的命令。

## Table of Contents

* [Features](#features)
* [Install](#install)
* [Usage](#usage)
  * [`Login`](#login)
  * [`Call API`](#callapi)
* [API](#api)
  * [`adduserByLeagcy`](#adduserByLeagcy)
  * [`adduserBySso`](#adduserBySso)
  * [`runCmd`](#runCmd)
  * [`runCmdWithCreds`](#runCmdWithCreds)
  * [`adduserBySsoUnsafe`](#adduserBySsoUnsafe)
  * [`checkSsoToken`](#checkSsoToken)

## Features

- 以函数调用的方式执行[npm cli command](https://docs.npmjs.com/cli-documentation/cli-commands)
- 提供legacy和sso两种登录API
- 在函数调用时指定登录凭证，避免不同用户之间互相影响

## Install

```
npm i npm-command-call
```

## Usage

### Login

根据使用场景在下面三种方式中选择一种：

| 方式 | 使用场景 |
| :------ | :------ |
| 1、[authentication token](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow) | 运行时使用一个账户，静态指定 |
| 2、使用登录API和默认的登录态管理 | 运行时使用一个账户，动态指定 |
| 3、使用登录API并自己管理登录态 | 运行时并发使用多个账户，动态指定 |

### <a name="callapi"></a> Call API

引入API并调用。

#### 示例

```javascript
const npmCmdCall = require('npm-command-call')

npmCmdCall.runCmd(['whoami']).catch((err) => {
  console.log(err)
})
```

```typescript
import * as npmCmdCall from('npm-command-call')

npmCmdCall.runCmdWithCreds(['whoami'], {
  token: '3fd34677-e7a6-4e21-9d84-******'
}).catch((err) => {
  console.log(err)
})
```

#### 说明

对于前两种登录方式，使用[`runCmd`](#runCmd)；对于最后一种登录方式，使用[`runCmdWithCreds`](#runCmdWithCreds)。

## API

### <a name="adduserByLeagcy"></a> `> adduserByLeagcy(userInfo, registry, scope, self) -> Promise<{token}>`

使用密码进行登录

#### 参数说明

`userInfo`指用户信息，属性包括`username`,`password`,`email`，必填;`registry`指[npm-registry](https://docs.npmjs.com/misc/registry)，选填;`scope`指[npm-scope](https://docs.npmjs.com/misc/scope.html)，选填;`self`指是否要自己处理登录态，默认为false，选填。

#### 示例

```javascript
adduserByLeagcy({
  username: 'u******',
  password: 'p******',
  email: 'e******'
}).catch((err) => {
  console.log(err)
})
```

### <a name="adduserBySso"></a> `> adduserBySso(registry, scope, cb, ssoType, self) -> Promise<{token}>`

使用SSO进行登录

#### 参数说明

`registry`指[npm-registry](https://docs.npmjs.com/misc/registry)，选填;`scope`指[npm-scope](https://docs.npmjs.com/misc/scope.html)，选填;`cb`指处理sso链接的函数，默认打开浏览器并访问该链接，选填;`ssoType`指处理sso的类型，取值包括’oauth‘和’saml‘，默认为’oauth‘，选填;`self`指是否要自己处理登录态，默认为false，选填。

#### 示例

```javascript
adduserBySso('https://registry.npmjs.org', undefined, (ssoUrl)) => {
  openUrl(ssoUrl)) // 以某种形式展示ssoUrl，使得用户可以访问
}, 'oauth', true).then(({ token }) => {
  save({ token }) // 以某种形式保存登录态
}).catch((err) => {
  console.log(err)
})
```

### <a name="runCmd"></a> `> runCmd(argvArr) -> Promise<string>`

运行命令

#### 参数说明

`argvArr`指命令行参数，必填。

#### 示例

```javascript
runCommand(['whoami', '--registry=https://registry.npmjs.org']).catch((err) => {
  console.log(err)
})
```

### <a name="runCmdWithCreds"></a> `> runCmdWithCreds(argvArr, creds = {}, registry) -> Promise<string>`

指定登录态运行命令

#### 参数说明

`argvArr`指命令行参数，必填；`creds`指用户凭证，属性包括`token`，必填；`registry`指[npm-registry](https://docs.npmjs.com/misc/registry)，选填;

#### 示例

```javascript
runCmdWithCreds(["publish", ".", "--tag=beta"], {
  token: '3fd34677-e7a6-4e21-9d84-******'
}).catch((err) => {
  console.log(err)
})
```

### <a name="adduserBySsoUnsafe"></a> `> adduserBySsoUnsafe(registry, scope, ssoType) -> Promise<{ token: string, sso: string }>`

使用SSO进行登录，返回token和sso链接，返回的token需要等点击sso链接进行登录后才会生效。

#### 参数说明

`registry`指[npm-registry](https://docs.npmjs.com/misc/registry)，选填;`scope`指[npm-scope](https://docs.npmjs.com/misc/scope.html)，选填;`ssoType`指处理sso的类型，取值包括’oauth‘和’saml‘，默认为’oauth‘，选填;

#### 示例

```javascript
adduserBySsoUnsafe('https://registry.npmjs.org').then(({ token, sso }) => {
  openUrl(sso) // 在浏览器上打开链接进行登录
  save({ token }) // 以某种形式保存登录态
}).catch((err) => {
  console.log(err)
})
```

### <a name="checkSsoToken"></a> `> checkSsoToken(token, registry, scope) -> Promise<{ token: string, sso: string }>`

检测token是否生效，结合[`adduserBySsoUnsafe`](#adduserBySsoUnsafe)使用。

#### 参数说明

`token`指[`adduserBySsoUnsafe`](#adduserBySsoUnsafe)返回的授权令牌，必填;`registry`指[npm-registry](https://docs.npmjs.com/misc/registry)，选填;`scope`指[npm-scope](https://docs.npmjs.com/misc/scope.html)，选填;

#### 示例

```javascript
adduserBySsoUnsafe('https://registry.npmjs.org')
.then(({ token, sso }) => {
  openUrl(sso) // 在浏览器上打开链接进行登录
  return checkSsoToken(token, 'https://registry.npmjs.org',)
}).catch((err) => {
  console.log(err)
})
```

## License

[MIT](https://github.com/microsoft/vscode/blob/master/LICENSE.txt)
