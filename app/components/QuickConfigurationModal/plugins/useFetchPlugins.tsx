import { useState, useEffect } from 'react';

import { useInternal, useManager } from '../managerHooks';
import type { AvailablePluginData, InstalledPluginData, InstalledPluginsData } from './model';

type PluginsHook = {
    loading: boolean;
    plugins?: {
        available: AvailablePluginData[];
        installed: InstalledPluginData[];
    };
    error?: string;
};

const useFetchPlugins = () => {
    const manager = useManager();
    const internal = useInternal();
    const [state, setState] = useState<PluginsHook>(() => ({ loading: true }));
    useEffect(() => {
        let mounted = true;
        Promise.all([
            internal.doGet('/external/content', { url: Stage.i18n.t('widgets.common.urls.pluginsCatalog') }) as Promise<
                AvailablePluginData[]
            >,
            manager.doGet('/plugins?_include=distribution,package_name,package_version,visibility') as Promise<
                InstalledPluginsData
            >
        ])
            .then(([available, installed]) => {
                if (mounted) {
                    setState({
                        loading: false,
                        plugins: {
                            available,
                            installed: installed.items
                        }
                    });
                }
            })
            .catch(() => {
                setState({
                    loading: false,
                    error: 'Plugins information loading error.'
                });
            });
        return () => {
            mounted = false;
        };
    }, []);
    return state;
};

export default useFetchPlugins;
