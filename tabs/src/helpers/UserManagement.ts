import {Providers} from '@microsoft/mgt-element'


async function GraphApiGetCall(api: string)
{
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

async function GraphApiPostCall(api: string, object: any)
{
    let provider = Providers.globalProvider;

    return new Promise<any>((resolve, reject) => {
        provider.graph.client.api(api).version('beta').post(object).then(response => {
            resolve(response)
        }).catch(err => {
            reject(err.message)
        } )

    })

}

async function GetUsers()
{
    return new Promise<any>((resolve, reject) => {
        GraphApiGetCall('/users').then(response => {
            if(response['value'].length === 0)
                reject('Returned count of users is 0')
           else
               resolve(response['value'])

        }).catch(err => {
            reject(err.message)
        })
    })
}

async function GetTeams()
{
    return new Promise<any>((resolve, reject) => {
        GraphApiGetCall('/teams').then(response => {
            if(response['value'].length === 0)
                reject('Returned count of teams is 0')
            else
                resolve(response['value'])
        }).catch(err => reject(err.message))
    })

}

// Adds a single user to Office 365
async function AddNewUser(userObject: any)
{

    return new Promise<any>((resolve, reject) => {
        GraphApiPostCall('/users', userObject).then(response => {

        })

    })

}

// Adds the user to specified team
async function AddUserToTeam(userId: string, teamId: string)
{

}

async function DeleteUser(userId: string)
{

}

export {
    GetUsers,
    GetTeams,
    AddNewUser,
    AddUserToTeam

}