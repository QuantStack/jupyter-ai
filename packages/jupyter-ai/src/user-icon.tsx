import { DefaultIconRenderer, UsersItem } from '@jupyter/collaboration';
import {
  CollaborativeChatModel,
  IChatChanges,
  YChat
} from 'jupyterlab-collaborative-chat';
import React, { useEffect, useRef, useState } from 'react';

/**
 * The user icon renderer.
 */
export const userIconRenderer = (
  props: UsersItem.IIconRendererProps
): JSX.Element => {
  const { user } = props;

  if (user.userData.name === 'Jupyternaut') {
    return <AgentIconRenderer {...props} />;
  }

  return <DefaultIconRenderer user={user} />;
};

/**
 * The user icon renderer for an AI agent.
 * It modify the metadata of the ydocument to enable/disable the AI agent.
 */
const AgentIconRenderer = (
  props: UsersItem.IIconRendererProps
): JSX.Element => {
  const { user, model } = props;
  const [iconClass, setIconClass] = useState<string>('');
  const sharedModel = useRef<YChat>(
    (model as CollaborativeChatModel).sharedModel
  );

  useEffect(() => {
    // Update the icon class.
    const updateStatus = () => {
      const agents =
        (sharedModel.current.getMetadata('agents') as string[]) || [];
      setIconClass(
        agents.includes(user.userData.username) ? '' : 'disconnected'
      );
    };

    const onChange = (_: YChat, changes: IChatChanges) => {
      if (changes.metadataChanges) {
        updateStatus();
      }
    };

    sharedModel.current.changed.connect(onChange);
    updateStatus();
    return () => {
      sharedModel.current.changed.disconnect(updateStatus);
    };
  }, [model]);

  const onclick = () => {
    const agents =
      (sharedModel.current.getMetadata('agents') as string[]) || [];
    const index = agents.indexOf(user.userData.username);
    if (index > -1) {
      agents.splice(index, 1);
    } else {
      agents.push(user.userData.username);
    }
    sharedModel.current.setMetadata('agents', agents);
  };

  return (
    <DefaultIconRenderer user={user} onClick={onclick} className={iconClass} />
  );
};
