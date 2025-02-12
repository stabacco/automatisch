import * as React from 'react';
import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import type { PopoverProps } from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import { useSnackbar } from 'notistack';

import Can from 'components/Can';
import { DELETE_FLOW } from 'graphql/mutations/delete-flow';
import { DUPLICATE_FLOW } from 'graphql/mutations/duplicate-flow';
import * as URLS from 'config/urls';
import useFormatMessage from 'hooks/useFormatMessage';

type ContextMenuProps = {
  flowId: string;
  onClose: () => void;
  anchorEl: PopoverProps['anchorEl'];
};

export default function ContextMenu(
  props: ContextMenuProps
): React.ReactElement {
  const { flowId, onClose, anchorEl } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [deleteFlow] = useMutation(DELETE_FLOW);
  const [duplicateFlow] = useMutation(
    DUPLICATE_FLOW,
    {
      refetchQueries: ['GetFlows'],
    }
  );
  const formatMessage = useFormatMessage();

  const onFlowDuplicate = React.useCallback(async () => {
    await duplicateFlow({
      variables: { input: { id: flowId } },
    });

    enqueueSnackbar(formatMessage('flow.successfullyDuplicated'), {
      variant: 'success',
    });

    onClose();
  }, [flowId, onClose, duplicateFlow]);

  const onFlowDelete = React.useCallback(async () => {
    await deleteFlow({
      variables: { input: { id: flowId } },
      update: (cache) => {
        const flowCacheId = cache.identify({
          __typename: 'Flow',
          id: flowId,
        });

        cache.evict({
          id: flowCacheId,
        });
      },
    });

    enqueueSnackbar(formatMessage('flow.successfullyDeleted'), {
      variant: 'success',
    });

    onClose();
  }, [flowId, onClose, deleteFlow]);

  return (
    <Menu
      open={true}
      onClose={onClose}
      hideBackdrop={false}
      anchorEl={anchorEl}
    >
      <Can I="read" a="Flow" passThrough>
        {(allowed) => (
          <MenuItem
            disabled={!allowed}
            component={Link}
            to={URLS.FLOW(flowId)}
          >
            {formatMessage('flow.view')}
          </MenuItem>
        )}
      </Can>

      <Can I="create" a="Flow" passThrough>
        {(allowed) => (
          <MenuItem
            disabled={!allowed}
            onClick={onFlowDuplicate}
          >
            {formatMessage('flow.duplicate')}
          </MenuItem>
        )}
      </Can>

      <Can I="delete" a="Flow" passThrough>
        {(allowed) => (
          <MenuItem
            disabled={!allowed}
            onClick={onFlowDelete}
          >
            {formatMessage('flow.delete')}
          </MenuItem>
        )}
      </Can>
    </Menu>
  );
}
