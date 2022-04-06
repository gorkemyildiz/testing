import { Providers } from '@microsoft/mgt-element'

async function GraphApiGetCall(api: string) {
    let provider = Providers.globalProvider

    return new Promise<any>((resolve, reject) => {
        provider.graph.client.api(api).version('beta').get().then(
            response => {
                resolve(response)
            }
        ).catch(err => {
            reject(err.message)
        })

    })

}

async function GraphApiPostCall(api: string, object: any) {
    let provider = Providers.globalProvider;

    return new Promise<any>((resolve, reject) => {
        provider.graph.client.api(api).version('beta').post(object).then(response => {
            resolve(response)
        }).catch(err => {
            reject(err.message)
        })

    })
}

async function GraphApiDeleteCall(api: string)
{
    let provider = Providers.globalProvider;

    return new Promise<any>((resolve, reject) => {
        provider.graph.client.api(api).version('beta').delete().then(response => {
            resolve(response)
        }).catch(err => {
            reject(err.message)
        })
    })
}

async function GetUsers() {
    return new Promise<Array<any>>((resolve, reject) => {
        GraphApiGetCall('/users').then(response => {
            if (response.value.length === 0)
                reject('Returned count of users is 0')

            else
                resolve(response.value)

        }).catch(err => {
            reject(err.message)
        })
    })
}

async function GetTeams() {
    return new Promise<any>((resolve, reject) => {
        GraphApiGetCall('/teams').then(response => {
            if (response.value.length === 0)
                reject('Returned count of teams is 0')
            else
                resolve(response.value)
        }).catch(err => reject(err.message))
    })

}

async function GetMe() {
    return new Promise<any>((resolve, reject) => {
        GraphApiGetCall('/me').then(response => {
            if (!response)
                reject('Returned count of teams is 0')
            else
                resolve(response)
        }).catch(err => reject(err.message))
    })

}

async function GetJoinedTeams() {
    return new Promise<any>((resolve, reject) => {
        GraphApiGetCall('/me/joinedTeams').then(response => {
            if (response.value.length === 0)
                reject('No joined teams found for signed in user')
            else
                resolve(response.value)
        })
    })
}

async function GetMemberOfTeam(teamId: string) {
    return new Promise<any>((resolve, reject) => {
        GraphApiGetCall(`/teams/${teamId}/members`).then(response => {
            if (response.value.length === 0)
                reject('No members found for the specified team')
            else
                resolve(response.value)
        })
    })
}

// Adds a single user to Office 365
async function AddNewUser(userObject: any) {
    return new Promise<any>((resolve, reject) => {
        GraphApiPostCall('/users', userObject).then(response => {
            resolve(response)
        }).catch(err => reject(err.message))
    })
}


// Adds the user to specified team
async function AddUserToTeam(userId: string, teamId: string, roles: Array<string>) {
    let conversationMember = {
        '@odata.type': '#microsoft.graph.aadUserConversationMember',
        'roles': roles,
        'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${userId}')`
    }

    return new Promise<any>((resolve, reject) => {
        if (userId === '' || teamId === '')
            reject('Insufficient data for user creation. Please check your "UserId" and "TeamId" parameters')
        else
            GraphApiPostCall(`/teams/${teamId}/members`, conversationMember)
    })
}

async function DeleteUser(userId: string){
    return new Promise<any>((resolve, reject) => {
        if (userId === '')
           reject('UserId not provided. Please provide a valid userId to DeleteUser function')
        else
            GraphApiDeleteCall(`/users/${userId}`).then(response => resolve(response)).catch(err => console.error(err.message))
    })

}

export {
    GetUsers,
    GetTeams,
    GetMemberOfTeam,
    GetJoinedTeams,
    AddNewUser,
    AddUserToTeam,
    GetMe,
    GraphApiGetCall,
    DeleteUser

}