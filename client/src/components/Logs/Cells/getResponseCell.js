import React from 'react';
import { REQ_STATUS_TO_LABEL_MAP, formatElapsedMs } from '../../../helpers/helpers';
import {
    CUSTOM_FILTERING_RULES_ID,
    FILTERED_STATUS,
} from '../../../helpers/constants';
import getHintElement from './getHintElement';

const getFilterName = (filters, whitelistFilters, filterId, t) => {
    if (filterId === CUSTOM_FILTERING_RULES_ID) {
        return t('custom_filter_rules');
    }

    const filter = filters.find(filter => filter.id === filterId)
        || whitelistFilters.find(filter => filter.id === filterId);
    let filterName = '';

    if (filter) {
        filterName = filter.name;
    }

    if (!filterName) {
        filterName = t('unknown_filter', { filterId });
    }

    return filterName;
};

const getResponseCell = (row, filtering, t, isDetailed) => {
    const { value: responses, original } = row;
    const {
        reason, filterId, rule, status, domain, elapsedMs,
    } = original;

    const { filters, whitelistFilters } = filtering;
    const formattedElapsedMs = formatElapsedMs(elapsedMs, t);

    const statusLabel = REQ_STATUS_TO_LABEL_MAP[reason] || reason;
    const filter = getFilterName(filters, whitelistFilters, filterId, t);

    const FILTERED_STATUS_TO_FIELDS_MAP = {
        [FILTERED_STATUS.NOT_FILTERED_NOT_FOUND]: {
            encryption_status: statusLabel,
            install_settings_dns: domain,
            elapsed: formattedElapsedMs,
            request_table_header: responses && responses.join('\n'),
        },
        [FILTERED_STATUS.FILTERED_BLOCKED_SERVICE]: {
            encryption_status: statusLabel,
            filter,
            rule_label: rule,
            response_table_header: status,
        },
        [FILTERED_STATUS.FILTERED_SAFE_SEARCH]: {
            encryption_status: statusLabel,
            install_settings_dns: domain,
            elapsed: formattedElapsedMs,
        },
        [FILTERED_STATUS.FILTERED_BLACK_LIST]: {
            encryption_status: statusLabel,
            install_settings_dns: domain,
            elapsed: formattedElapsedMs,
        },
    };

    const fields = FILTERED_STATUS_TO_FIELDS_MAP[reason] ? Object.entries(FILTERED_STATUS_TO_FIELDS_MAP[reason]) : '';
    const detailedInfo = reason === FILTERED_STATUS.FILTERED_BLOCKED_SERVICE
    || reason === FILTERED_STATUS.FILTERED_BLACK_LIST
        ? filter : formattedElapsedMs;

    return (
        <div className="logs__row">
            {fields && getHintElement({
                className: `icons mr-4 icon--small ${isDetailed ? 'my-3' : ''}`,
                dataTip: true,
                xlinkHref: 'question',
                contentItemClass: 'text-pre text-truncate key-colon',
                title: 'details',
                content: fields,
                place: 'bottom',
            })}
            <div>
                <div>{t(statusLabel)}</div>
                {isDetailed && <div
                    className="detailed-info d-none d-sm-block pt-1 w-85 o-hidden text-truncate">{detailedInfo}</div>}
            </div>
        </div>
    );
};

export default getResponseCell;