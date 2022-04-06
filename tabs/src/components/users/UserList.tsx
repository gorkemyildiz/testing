import {FC, useCallback, useEffect, useMemo, useState} from "react"
import {IGraphApiUserDefinition, IUser} from "../../models/user";

import {buildColumns, DetailsList, DetailsListLayoutMode, IColumn, Selection, SelectionMode} from "@fluentui/react/lib/DetailsList";
import {Login} from "@microsoft/mgt-react";
import {AddNewUser, DeleteUser, GetUsers} from "../../helpers/GraphAPIHelpers";
import {Flex} from "@fluentui/react-northstar";

import {Stack} from "react-bootstrap";
import * as XLSX from "xlsx";

import Dropzone from "react-dropzone";
import {AcceptIcon} from '@fluentui/react-icons-mdl2';
import {Providers} from "@microsoft/mgt";
import './UserList.css'
import {MarqueeSelection} from "@fluentui/react/lib/MarqueeSelection";
import Modal from "@fluentui/react/lib/Modal";
import {
    ActionButton, DefaultButton, Dialog, DialogFooter,
    DialogType, IIconProps, LayerHost, Overlay, PrimaryButton, Spinner, SpinnerSize, TextField
} from "@fluentui/react";
import {useBoolean} from "@fluentui/react-hooks";


type Props = {}

const UserList: FC<Props> = ({}) => {

    let provider = Providers.globalProvider;

    const [items, setItems] = useState<Array<IUser>>([]);
    const [columns, setColumns] = useState<Array<IColumn>>(() => {
        return []
    });
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [showProcessOverlay, setShowProcessOverlay] = useState<boolean>(false);
    const [currentProgress, setCurrentProgress] = useState<number>(() => {
        return 0;
    });
    const [totalJob, setTotalJob] = useState<number>(() => {
        return 0
    });
    const [processFinished, setProcessFinished] = useState<boolean>(true);
    const [deletingEnabled, setDeletingEnabled] = useState<boolean>(false);
    const [selection, setSelection] = useState<Selection>(() => {
        return new Selection({
            onSelectionChanged: () => {
                getSelectionDetails()
            }
        })
    });
    const [selectedUsers, setSelectedUsers] = useState<Array<IUser>>([]);

    const [hideDeleteUserDialog, {toggle: toggleHideDeleteUserDialog}] = useBoolean(true);

    function getSelectionDetails() {
        console.log(`Selected: ${selection.getSelectedCount()}`)
        const selectionCount = selection.getSelectedCount()

        if (selectionCount > 0) {
            setDeletingEnabled(true)
            console.log(selection.getSelection())
            setSelectedUsers(selection.getSelection() as Array<IUser>);
        } else {
            setDeletingEnabled(false)
        }


    }


    const [userToCreate, setUserToCreate] = useState<IGraphApiUserDefinition>({
        accountEnabled: false,
        displayName: '',
        mail: '',
        mailNickname: '',
        userPrincipalName: '',
        department: '',
        passwordProfile: {
            forceChangePasswordNextSignIn: true,
            password: ''
        }
    });

    useEffect(() => {

        if (provider != undefined) {
            // @ts-ignore
            provider.login().then(response => console.log(user.value))
        }

        setItems([])
        GetUsers().then(response => {
            response.map((user, index) => {
                setItems(prevState => {
                    return prevState.concat(
                        {
                            id: user['id'],
                            name: user['displayName'],
                            department: user['department'],
                            email: user['userPrincipalName'],
                            phoneNumber: user['businessPhones'][0]
                        }
                    )
                })
            })
        })
    }, []);


    const buildColumn = (): Array<IColumn> => {
        return buildColumns(items).filter(column => column.name === 'name' || column.name === 'email' || column.name === 'department' || column.name === 'phoneNumber')
    }

    useEffect(() => {
        setColumns(buildColumn())
    }, [items]);


    const onRenderItemColumn = (item: IUser, index: number, column: IColumn): JSX.Element | React.ReactText => {
        if (column.key === 'name') return <div>{item.name}</div>
        else if (column.key === 'department') return <div>{item.department}</div>
        else if (column.key === 'email') return <div>{item.email}</div>
        else if (column.key === 'phoneNumber') return <div>{item.phoneNumber}</div>

        else return <></>
    }

    const showModal = () => setIsModalOpen(true)
    const hideModal = () => {
        setIsModalOpen(false);
        setProcessFinished(true)
    }

    const [usersFile, setUsersFile] = useState<Array<any>>([]);

    let name: string = ''
    let surname: string = ''
    let mail: string = ''
    let tempPassword: string = ''
    let department: string = ''

    // Single User creation
    let bShouldSubmit: boolean = false

    function SubmitUser() {
        bShouldSubmit = true

        setUserToCreate({
            accountEnabled: true,
            displayName: `${name} ${surname}`,
            mail: mail,
            mailNickname: `${name}_At_microsoft`,
            userPrincipalName: `${name}${surname[0]}@yjzlb.onmicrosoft.com`,
            department: department,
            passwordProfile: {
                forceChangePasswordNextSignIn: true,
                password: tempPassword
            }
        })

        console.log('Submit User')
    }

    useEffect(() => {
        console.log(userToCreate)

        AddNewUser(userToCreate).then(response => console.log(response)).catch(err => console.warn(`error: ${err.message}`))
        bShouldSubmit = false

    }, [userToCreate]);

    // TODO: Fix this bad practice by binding the creation event to the create button.
    // TODO: It might also be better if I list the users before creating them. So the admin can have last chance to check.
    // Bulk User Creation
    useEffect(() => {
        if (usersFile === null || usersFile.length === 0) {
            return
        }


        var users: Array<any> = []

        for (var index = 1; index < usersFile.length; index++) {
            let principalName: string = `${usersFile[index][0]}${usersFile[index][1]}@yjzlb.onmicrosoft.com`

            var userObject = {
                accountEnabled: true,
                displayName: `${usersFile[index][0]} ${usersFile[index][1]}`,
                mailNickname: `${usersFile[index][0]}_At_microsoft`,
                userPrincipalName: principalName,
                department: `${usersFile[index][4]}`,
                passwordProfile: {
                    forceChangePasswordNextSignIn: true,
                    password: usersFile[index][3]
                }
            }

            users.push(userObject)
        }

        console.table(users)
        if (users.length === 0) return;

        setTotalJob(users.length)
        setShowProcessOverlay(true)
        setProcessFinished(false)

        users.map((user, index) => {
            AddNewUser(user)
                .then(response => {
                    setCurrentProgress(index + 1)
                    console.log(response)
                }).catch(err => {
                setCurrentProgress(index + 1)
                console.error(err.message)
            }).finally(() => {
                setCurrentProgress(0)
                setTotalJob(0)
                setProcessFinished(true)

            })
        })

    }, [usersFile]);

    useEffect(() => {
        if (!processFinished) return
        setTimeout(() => {
            setShowProcessOverlay(false)
            setProcessFinished(false)
        }, 1000)
    }, [processFinished])

    const handleOnDrop = useCallback((acceptedFiles: any) => {
        if (acceptedFiles === null)
            return

        let file = acceptedFiles[0]

        var reader = new FileReader();
        reader.onload = (e) => {
            if (e.target === null)
                return

            var data = e.target.result;
            let readedData = XLSX.read(data, {type: 'binary'});
            const wsname = readedData.SheetNames[0]
            const ws = readedData.Sheets[wsname]

            const dataParse = XLSX.utils.sheet_to_json(ws, {header: 1})
            console.table(dataParse)

            setUsersFile(dataParse)

        }

        reader.readAsArrayBuffer(file)
    }, [])

    function deleteUsers(users: Array<IUser>) {
        let errors : number = 0

        users.forEach(async (user) => {
            await DeleteUser(user.id).catch(err => {
                errors += 1;
                console.error(`User ${user.name} couldn't delete`)
            })
        })

        if(errors > 0)
        {
            console.error(`${users} user(s) could not be deleted! Check previous log entries to see which users.`)
        }

        toggleHideDeleteUserDialog()
    }

    function handleDeleteButtonClick() {
        deleteUsers(selectedUsers)
    }

    let dialogContentProps = {
        type: DialogType.largeHeader,
        title: 'Delete Users',
        subText: `Deleting ${selection.getSelectedCount()} user(s)`
    };

    const modalPropsStyles = { main: {maxWidth: 450}}

    const modalProps = {
        isBlocking: true,
        styles: modalPropsStyles
    }

    const addUserIcon : IIconProps = { iconName: 'AddFriend'}

    return (
        <>

            <LayerHost id='user-processing-layer' className='processing-layer'/>
            <Modal
                titleAriaId='AddUserModalId'
                isOpen={isModalOpen}
                onDismiss={hideModal}
                isBlocking={true}
                containerClassName={'add-user-modal-container'}
            >
                {showProcessOverlay &&

                    <Overlay className="overlayUpload">
                        {
                            !processFinished ?
                                <div className="uploadSpinner">
                                    <Spinner label={`${currentProgress}/${totalJob}`} size={SpinnerSize.large}/>
                                </div> :
                                <div style={{textAlign: 'center', marginTop: '14rem', fontSize: '7rem'}}>
                                    <AcceptIcon style={{
                                        border: '4px solid #04a904',
                                        padding: '1rem',
                                        borderRadius: '1rem',
                                        color: '#22c422'
                                    }}/>
                                </div>
                        }

                    </Overlay>
                }
                <div style={{padding: '2rem'}}>
                    <Flex column>
                        {/* Header */}
                        <Flex><h1>Add Users</h1></Flex>

                        {/* Body */}
                        <Flex style={{alignContent: 'top'}}>
                            <Flex column>
                                <div>
                                    <Stack>
                                        <TextField onChange={e => {
                                            name = e.currentTarget.value
                                        }} label='Name'/>
                                        <TextField onChange={e => {
                                            surname = e.currentTarget.value
                                        }} label='Surname'/>
                                        <TextField onChange={e => {
                                            mail = `${e.currentTarget.value}`
                                        }}
                                                   label='Mail'
                                        />
                                        <TextField onChange={e => {
                                            department = e.currentTarget.value
                                        }} label='Department'/>
                                        <TextField onChange={e => {
                                            tempPassword = e.currentTarget.value
                                        }} label='Temp Password'/>

                                    </Stack>
                                </div>
                                <div>
                                    <Dropzone
                                        onDropRejected={(fileRejections) => console.log(fileRejections)}
                                        accept={'.xlsx'}
                                        onDrop={handleOnDrop}
                                        onDropAccepted={() => console.log('Drop Accepted')}
                                        noDragEventsBubbling={true} // God sent arcane spell... BEWARE!!!
                                    >
                                        {({getRootProps, getInputProps}) => (
                                            <div className="container">
                                                <div
                                                    {...getRootProps()}
                                                    className=''
                                                    style={{
                                                        border: '2px dotted #464eb8',
                                                        padding: '2rem',
                                                        color: '#464eb8'
                                                    }}
                                                >
                                                    <input {...getInputProps()} />
                                                    <p>Drag and drop some files here, or click to select files</p>
                                                </div>
                                            </div>
                                        )}
                                    </Dropzone>
                                </div>
                            </Flex>
                        </Flex>

                        {/* Footer */}
                        <Flex style={{justifyContent: 'end', paddingTop: '1rem'}}>
                            <DefaultButton onClick={SubmitUser} text={'Apply'} style={{marginRight: '1rem'}}/>
                            <DefaultButton onClick={hideModal} text={'Cancel'}/>
                        </Flex>
                    </Flex>
                </div>
            </Modal>

            <Dialog
                hidden={hideDeleteUserDialog}
                onDismiss={toggleHideDeleteUserDialog}
                dialogContentProps={dialogContentProps}
                modalProps={modalProps}
            >
                <DialogFooter>
                    <DefaultButton onClick={toggleHideDeleteUserDialog} text="Cancel" />
                    <PrimaryButton style={{ backgroundColor: '#d13438' }} onClick={handleDeleteButtonClick} text="Delete" />
                </DialogFooter>
            </Dialog>

            <div className='container-buttons'>
                <Flex className='buttons-stack'>
                    <Login/>

                    <Stack>
                        <ActionButton iconProps={addUserIcon} onClick={showModal}>
                            Create Users
                        </ActionButton>
                        {deletingEnabled ?
                            <ActionButton iconProps={{iconName: 'Delete'}} disabled={!deletingEnabled}
                                          onClick={toggleHideDeleteUserDialog}
                            >Delete Users</ActionButton> : <></>
                        }


                    </Stack>
                </Flex>
            </div>

            <div className="container">


                    <MarqueeSelection selection={selection}>
                        {/* @ts-ignore*/}
                        <DetailsList onRenderItemColumn={onRenderItemColumn}
                                     items={items}
                                     columns={columns}
                                     selection={selection}
                                     selectionMode={SelectionMode.multiple}
                                     layoutMode={DetailsListLayoutMode.justified}
                                     selectionPreservedOnEmptyClick={true}
                                     setKey="multiple"
                                     ariaLabelForSelectionColumn="Toggle selection"
                                     ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                                     checkButtonAriaLabel="select row"
                        />
                    </MarqueeSelection>

            </div>
        </>
    )
}

export default UserList