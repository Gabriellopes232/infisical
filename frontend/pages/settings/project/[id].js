import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { faCheck, faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "~/components/basic/buttons/Button";
import AddServiceTokenDialog from "~/components/basic/dialog/AddServiceTokenDialog";
import InputField from "~/components/basic/InputField";
import ServiceTokenTable from "~/components/basic/table/ServiceTokenTable";
import NavHeader from "~/components/navigation/NavHeader";

import getServiceTokens from "../../api/serviceToken/getServiceTokens";
import deleteWorkspace from "../../api/workspace/deleteWorkspace";
import getWorkspaces from "../../api/workspace/getWorkspaces";
import renameWorkspace from "../../api/workspace/renameWorkspace";


const envOptions = [
  {
    displayName: 'Development',
    cliName: 'dev'
  },
  {
    displayName: 'Staging',
    cliName: 'staging'
  },
  {
    displayName: 'Production',
    cliName: 'prod'
  },
  {
    displayName: 'Testing',
    cliName: 'test'
  }
]

export default function SettingsBasic() {
  const [buttonReady, setButtonReady] = useState(false);
  const [envOptionsState, setEnvOptionsState] = useState(envOptions);
  const [customEnvButtonReady, setCustomEnvButtonReady] = useState(false);
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [serviceTokens, setServiceTokens] = useState([]);
  const [workspaceToBeDeletedName, setWorkspaceToBeDeletedName] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  let [isAddServiceTokenDialogOpen, setIsAddServiceTokenDialogOpen] =
    useState(false);

  useEffect(async () => {
    let userWorkspaces = await getWorkspaces();
    userWorkspaces.map((userWorkspace) => {
      if (userWorkspace._id == router.query.id) {
        setWorkspaceName(userWorkspace.name);
      }
    });
    let tempServiceTokens = await getServiceTokens({
      workspaceId: router.query.id,
    });
    setServiceTokens(tempServiceTokens);
  }, []);

  const modifyWorkspaceName = (newName) => {
    setButtonReady(true);
    setWorkspaceName(newName);
  };

  const submitChanges = (newWorkspaceName) => {
    renameWorkspace(router.query.id, newWorkspaceName);
    setButtonReady(false);
  };

  useEffect(async () => {
    setWorkspaceId(router.query.id);
  }, []);

  function closeAddModal() {
    setIsAddOpen(false);
  }

  function openAddModal() {
    setIsAddOpen(true);
  }

  const closeAddServiceTokenModal = () => {
    setIsAddServiceTokenDialogOpen(false);
  };

  /**
   * This function deleted a workspace.
   * It first checks if there is more than one workspace aviable. Otherwise, it doesn't delete
   * It then checks if the name of the workspace to be deleted is correct. Otherwise, it doesn't delete.
   * It then deletes the workspace and forwards the user to another aviable workspace.
   */
  const executeDeletingWorkspace = async () => {
    let userWorkspaces = await getWorkspaces();

    if (userWorkspaces.length > 1) {
      if (
        userWorkspaces.filter(
          (workspace) => workspace._id == router.query.id
        )[0].name == workspaceToBeDeletedName
      ) {
        await deleteWorkspace(router.query.id);
        let userWorkspaces = await getWorkspaces();
        router.push("/dashboard/" + userWorkspaces[0]._id);
      }
    }
  };

  return (
    <div className="bg-bunker-800 max-h-screen flex flex-col justify-between text-white">
      <Head>
        <title>Settings</title>
        <link rel="icon" href="/infisical.ico" />
      </Head>
      <AddServiceTokenDialog
        isOpen={isAddServiceTokenDialogOpen}
        workspaceId={router.query.id}
        closeModal={closeAddServiceTokenModal}
        workspaceName={workspaceName}
      />
      <div className="flex flex-row mr-6 max-w-5xl">
        <div className="w-full max-h-screen pb-2 overflow-y-auto no-scrollbar no-scrollbar::-webkit-scrollbar">
          <NavHeader pageName="Project Settings" isProjectRelated={true} />
          <div className="flex flex-row justify-between items-center ml-6 my-8 text-xl max-w-5xl">
            <div className="flex flex-col justify-start items-start text-3xl">
              <p className="font-semibold mr-4 text-gray-200">
                Project Settings
              </p>
              <p className="font-normal mr-4 text-gray-400 text-base">
                These settings only apply to the currently selected Project.
              </p>
            </div>
          </div>
          <div className="flex flex-col ml-6 text-mineshaft-50">
            <div className="flex flex-col">
              <div className="min-w-md mt-2 flex flex-col items-start">
                <div className="bg-white/5 rounded-md px-6 pt-5 pb-4 flex flex-col items-start flex flex-col items-start w-full mb-6 pt-2">
                  <p className="text-xl font-semibold mb-4">Display Name</p>
                  <div className="max-h-28 w-full max-w-md mr-auto">
                    <InputField
                      onChangeHandler={modifyWorkspaceName}
                      type="varName"
                      value={workspaceName}
                      placeholder=""
                      isRequired
                    />
                  </div>
                  <div className="flex justify-start w-full">
                    <div className={`flex justify-start max-w-sm mt-4 mb-2`}>
                      <Button
                        text="Save Changes"
                        onButtonPressed={() => submitChanges(workspaceName)}
                        color="mineshaft"
                        size="md"
                        active={buttonReady}
                        iconDisabled={faCheck}
                        textDisabled="Saved"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-md px-6 pt-6 pb-2 flex flex-col items-start flex flex-col items-start w-full mb-6 mt-4">
                  <p className="text-xl font-semibold self-start">Project ID</p>
                  <p className="text-base text-gray-400 font-normal self-start mt-4">
                    To integrate Infisical into your code base and get automatic
                    injection of environmental variables, you should use the
                    following Project ID.
                  </p>
                  <p className="text-base text-gray-400 font-normal self-start">
                    For more guidance, including code snipets for various
                    languages and frameworks, see{" "}
                    {/* eslint-disable-next-line react/jsx-no-target-blank */}
                    <a
                      href="https://infisical.com/docs/getting-started/introduction"
                      target="_blank"
                      rel="noopener"
                      className="text-primary hover:opacity-80 duration-200"
                    >
                      Infisical Docs.
                    </a>
                  </p>
                  <div className="max-h-28 w-ful">
                    <InputField
                      type="varName"
                      value={router.query.id}
                      placeholder=""
                      isRequired
                      static
                      text="This is your project&apos;s auto-generated unique identifier. It can&apos;t be changed."
                    />
                  </div>
                </div>
                <div className="bg-white/5 rounded-md px-6 pt-5 flex flex-col items-start flex flex-col items-start w-full mt-4 mb-4 pt-2">
                  <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col w-full">
                      <p className="text-xl font-semibold mb-3">
                        Service Tokens
                      </p>
                      <p className="text-base text-gray-400 mb-4">
                        Every service token is specific to you, a certain
                        project and a certain environment within this project.
                      </p>
                    </div>
                    <div className="w-48">
                      <Button
                        text="Add New Token"
                        onButtonPressed={() => {
                          setIsAddServiceTokenDialogOpen(true);
                        }}
                        color="mineshaft"
                        icon={faPlus}
                        size="md"
                      />
                    </div>
                  </div>
                  <ServiceTokenTable
                    data={serviceTokens}
                    workspaceName={workspaceName}
                  />
                </div>

                <div className="bg-white/5 rounded-md px-6 flex flex-col items-start flex flex-col items-start w-full mb-6 mt-4 pb-6 pt-6">
									<p className="text-xl font-semibold self-start">
										Project Environments
									</p>
									<p className="text-md mr-1 text-gray-400 mt-2 self-start">
										Choose which environments will show up
										in your Dashboard. Some common ones
										include Development, Staging, and
										Production. Often, teams choose to add
										Testing.
									</p>
									<div className="rounded-md h-10 w-full mr-auto mt-4 flex flex-row overflow-x-auto no-scrollbar no-scrollbar::-webkit-scrollbar">
										{envOptionsState.map((env, id) => (
											<div key={id} className="bg-white/5 hover:bg-white/10 duration-100 h-full w-max px-3 flex flex-row items-center justify-between rounded-md mr-1 text-sm">
												{<span className="text-bunker-200 bg-transparent outline-none" onChange={(e) => console.log(e)} contentEditable={true}>{env.displayName}</span>}
                        (
                          {<span className="text-bunker-200 bg-transparent outline-none" contentEditable={true}>{env.cliName}</span>}
                        )
												<FontAwesomeIcon
                          icon={faX}
													className="h-3 w-3 ml-2 mt-0.5 text-white cursor-pointer"
												/>
											</div>
										))}
										<div
                      onClick={() => setEnvOptionsState([
                        ...envOptionsState,
                        {displayName: "Test", cliName: "test"}
                      ])} 
                      className="group bg-white/5 hover:bg-primary hover:text-black duration-200 text-bunker-200 h-full w-max py-1 px-3 flex flex-row items-center justify-between rounded-md mr-1 cursor-pointer text-sm font-semibold"
                    >
											<FontAwesomeIcon
                        icon={faPlus}
												className="h-4 w-4 text-white mr-2 group-hover:text-black"
											/>
											Add
										</div>
									</div>
									<p className="text-xs mr-1 mt-2 text-gray-400 self-start">
										Note: the text in brackets shows how
										these environmant should be accessed in
										CLI.
									</p>
                  <div className="flex justify-start w-full">
                    <div className={`flex justify-start max-w-sm mt-4 mb-2`}>
                      <Button
                        text="Save Changes"
                        onButtonPressed={() => submitChanges(workspaceName)}
                        color="mineshaft"
                        size="md"
                        active={buttonReady}
                        iconDisabled={faCheck}
                        textDisabled="Saved"
                      />
                    </div>
                  </div>
								</div>
              </div>
            </div>
            <div className="bg-white/5 rounded-md px-6 pt-6 pb-6 border-l border-red pl-6 flex flex-col items-start flex flex-col items-start w-full mb-6 mt-4 pb-4 pt-4">
              <p className="text-xl font-bold text-red">Danger Zone</p>
              <p className="mt-2 text-md text-gray-400">
                As soon as you delete this project, you will not be able to undo
                it. This will immediately remove all the keys. If you still want
                to do that, please enter the name of the project below.
              </p>
              <div className="max-h-28 w-full max-w-md mr-auto mt-4">
                <InputField
                  label="Project to be Deleted"
                  onChangeHandler={setWorkspaceToBeDeletedName}
                  type="varName"
                  value={workspaceToBeDeletedName}
                  placeholder=""
                  isRequired
                />
              </div>
              <button
                type="button"
                className="max-w-md mt-6 w-full inline-flex justify-center rounded-md border border-transparent bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-red hover:text-white hover:font-semibold hover:text-semibold duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={executeDeletingWorkspace}
              >
                Delete Project
              </button>
              <p className="mt-0.5 ml-1 text-xs text-gray-500">
                Note: You can only delete a project in case you have more than
                one.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

SettingsBasic.requireAuth = true;
