interface IWorkspaces {
    location: string
}

interface IUser {
    id: string
    name: string,
    department: string,
    email: string,
    phoneNumber: string

}

interface IGraphApiUserDefinition {
    accountEnabled: boolean,
    displayName: string,
    mail: string
    mailNickname: string,
    userPrincipalName: string,
    department: string
    passwordProfile: {
        forceChangePasswordNextSignIn: boolean,
        password: string
    }
}

export type {
    IWorkspaces,
    IUser,
    IGraphApiUserDefinition
}