import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  benchmarkAsyncStorage,
  benchmarkLeveldbBuffer,
  benchmarkLeveldbStr,
  benchmarkMMKV,
  BenchmarkResults,
  BenchmarkResultsView,
} from './benchmark';
import { leveldbExample, leveldbTests } from './example';

interface BenchmarkState {
  leveldbBuffer?: BenchmarkResults;
  leveldbStr?: BenchmarkResults;
  mmkv?: BenchmarkResults;
  leveldbExample?: boolean;
  leveldbTests: string[];
  asyncStorage?: BenchmarkResults;
  error?: string;
}

export default class App extends React.Component<{}, BenchmarkState> {
  state: BenchmarkState = { leveldbTests: [] };

  componentDidMount() {
    try {
      this.setState({
        leveldbStr: benchmarkLeveldbStr(),
        leveldbBuffer: benchmarkLeveldbBuffer(),
        // leveldbExample: leveldbExample(),
        // leveldbTests: leveldbTests(),
      });
      benchmarkMMKV().then((res) => {
        this.setState({
          mmkv: res,
        });
      });
      // benchmarkAsyncStorage().then(res => this.setState({asyncStorage: res}));
    } catch (e) {
      console.error('Error running benchmark:', e);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>
          Example validity:{' '}
          {this.state.leveldbExample == undefined
            ? ''
            : this.state.leveldbExample
            ? 'passed'
            : 'failed'}
        </Text>
        {this.state.leveldbBuffer && (
          <BenchmarkResultsView title="LevelDB Buffer" {...this.state.leveldbBuffer} />
        )}
        {this.state.leveldbStr && (
          <BenchmarkResultsView title="LevelDB String" {...this.state.leveldbStr} />
        )}
        {this.state.leveldbTests &&
          this.state.leveldbTests.map((msg, idx) => (
            <Text key={idx}>Test: {msg}</Text>
          ))}
        {/* {this.state.asyncStorage && <BenchmarkResultsView title="AsyncStorage" {...this.state.asyncStorage} />}
        {this.state.error && <Text>ERROR RUNNING: {this.state.error}</Text>} */}

        {this.state.mmkv && (
          <BenchmarkResultsView title="MMKV" {...this.state.mmkv} />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
