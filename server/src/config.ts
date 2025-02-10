export interface MenusPluginConfig {
  maxDepth?: number | null;
  layouts?: any;
}

export const defaultConfig: MenusPluginConfig = {
  maxDepth: null,
  layouts: {},
};

export default {
  default: defaultConfig,
  validator() {},
};
