/**
 * This file does the setup for integration with Reactotron, which is a
 * free desktop app for inspecting and debugging your React Native app.
 * @see https://github.com/infinitered/reactotron
 */
import { Platform, NativeModules } from 'react-native';

import { ArgType } from 'reactotron-core-client';
import { goBack, resetRoot, navigate } from '@/navigators/navigationUtilities';

import { reactotronRedux } from 'reactotron-redux';

import { Reactotron } from './ReactotronClient';

const reactotron = Reactotron.configure({
  name: require('../../package.json').name,
  onConnect: () => {
    Reactotron.clear();
  },
});

reactotron.use(reactotronRedux());

// reactotron.use(mmkvPlugin<ReactotronReactNative>({ storage }));

if (Platform.OS !== 'web') {
  reactotron.useReactNative({
    networking: {
      ignoreUrls: /symbolicate/,
    },
  });
}

reactotron.onCustomCommand({
  title: 'Show Dev Menu',
  description: 'Opens the React Native dev menu',
  command: 'showDevMenu',
  handler: () => {
    Reactotron.log('Showing React Native dev menu');
    NativeModules.DevMenu.show();
  },
});

reactotron.onCustomCommand({
  title: 'Reset Navigation State',
  description: 'Resets the navigation state',
  command: 'resetNavigation',
  handler: () => {
    Reactotron.log('resetting navigation state');
    resetRoot({ index: 0, routes: [] });
  },
});

reactotron.onCustomCommand<[{ name: 'route'; type: ArgType.String }]>({
  command: 'navigateTo',
  handler: args => {
    const { route } = args ?? {};
    if (route) {
      Reactotron.log(`Navigating to: ${route}`);
      navigate(route as any); // this should be tied to the navigator, but since this is for debugging, we can navigate to illegal routes
    } else {
      Reactotron.log('Could not navigate. No route provided.');
    }
  },
  title: 'Navigate To Screen',
  description: 'Navigates to a screen by name.',
  args: [{ name: 'route', type: ArgType.String }],
});

reactotron.onCustomCommand({
  title: 'Go Back',
  description: 'Goes back',
  command: 'goBack',
  handler: () => {
    Reactotron.log('Going back');
    goBack();
  },
});

console.tron = reactotron;

declare global {
  interface Console {
    /**
     * Reactotron client for logging, displaying, measuring performance, and more.
     * @see https://github.com/infinitered/reactotron
     * @example
     * if (__DEV__) {
     *  console.tron.display({
     *    name: 'JOKE',
     *    preview: 'What's the best thing about Switzerland?',
     *    value: 'I don't know, but the flag is a big plus!',
     *    important: true
     *  })
     * }
     */
    tron: typeof reactotron;
  }
}

reactotron.connect();

export default reactotron;
