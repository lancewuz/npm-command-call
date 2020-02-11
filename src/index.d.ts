
export interface UserInfo {
  username: string
  password: string
  email: string
}

export interface Creds {
  token: string
}

export type SsoType = 'oauth' | 'saml'

export function adduserByLeagcy(userInfo: UserInfo, registry?: string, scope?: string, self?: boolean): Promise<Creds>
export function adduserBySso(registry?: string, scope?: string, cb?: (url: string) => void, ssoType?: SsoType, self?: boolean): Promise<Creds>
export function runCmd(argvArr: string[]): Promise<string>
export function runCmdWithCreds(argvArr: string[], creds?: Creds, registry?: string): Promise<string>
