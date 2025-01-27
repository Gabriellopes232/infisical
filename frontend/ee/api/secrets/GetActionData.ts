import SecurityClient from '~/utilities/SecurityClient';


interface workspaceProps {
  actionId: string; 
}

/**
 * This function fetches the data for a certain action performed by a user
 * @param {object} obj
 * @param {string} obj.actionId - id of an action for which we are trying to get data
 * @returns
 */
const getActionData = async ({ actionId }: workspaceProps) => {
  return SecurityClient.fetchCall(
    '/api/v1/action/' + actionId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ).then(async (res) => {
    console.log(188, res)
    if (res && res.status == 200) {
      return (await res.json()).action;
    } else {
      console.log('Failed to get the info about an action');
    }
  });
};

export default getActionData;
