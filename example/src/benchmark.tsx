import { LevelDB } from 'react-native-leveldb';
import { Text } from 'react-native';
import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  compareReadWrite,
  getRandomString,
  getTestSetArrayBuffer,
  getTestSetString,
} from './test-util';
import { MMKV } from 'react-native-mmkv';


const benchmarkTestBedStr = getTestSetString(10000);


export interface BenchmarkResults {
  writeMany: { numKeys: number; durationMs: number };
  readMany: { numKeys: number; durationMs: number };
}


export function benchmarkLeveldbStr(): BenchmarkResults {
  let name = getRandomString(32) + '.db';
  const db = new LevelDB(name, true, true);

  let res: Partial<BenchmarkResults> = {};

  const writeKvs: [string, string][] = benchmarkTestBedStr;

  // === writeMany
  let started = new Date().getTime();
  for (const [k, v] of writeKvs) {
    db.put(k, v);
  }
  res.writeMany = {
    numKeys: writeKvs.length,
    durationMs: new Date().getTime() - started,
  };

  // === readMany
  const readKvs: [string, string][] = [];
  started = new Date().getTime();
  let it;
  for (it = db.newIterator().seekToFirst(); it.valid(); it.next()) {
    readKvs.push([it.keyStr(), it.keyStr()]);
  }
  it.close();
  res.readMany = {
    numKeys: readKvs.length,
    durationMs: new Date().getTime() - started,
  };
  db.close();

  compareReadWrite(writeKvs, readKvs);
  return res as BenchmarkResults;
}


export function benchmarkLeveldbBuffer(): BenchmarkResults {
  let name = getRandomString(32) + '.db';
  const db = new LevelDB(name, true, true);

  let res: Partial<BenchmarkResults> = {};

  const writeKvs: [ArrayBuffer, ArrayBuffer][] = getTestSetArrayBuffer(10000);

  // === writeMany
  let started = new Date().getTime();
  for (const [k, v] of writeKvs) {
    db.put(k, v);
  }
  res.writeMany = {
    numKeys: writeKvs.length,
    durationMs: new Date().getTime() - started,
  };

  // === readMany
  const readKvs: [ArrayBuffer, ArrayBuffer][] = [];
  started = new Date().getTime();
  let it;
  for (it = db.newIterator().seekToFirst(); it.valid(); it.next()) {
    readKvs.push([it.keyBuf(), it.valueBuf()]);
  }
  it.close();
  res.readMany = {
    numKeys: readKvs.length,
    durationMs: new Date().getTime() - started,
  };
  db.close();

  compareReadWrite(writeKvs, readKvs);
  return res as BenchmarkResults;
}

export async function benchmarkAsyncStorage(): Promise<BenchmarkResults> {
  console.info('Clearing AsyncStorage');
  try {
    await AsyncStorage.clear();
  } catch (e: any) {
    if (!e?.message?.includes('Failed to delete storage directory')) {
      throw e;
    }
  }

  let res: Partial<BenchmarkResults> = {};

  const writeKvs: [string, string][] = getTestSetString(10000);

  // === writeMany
  let started = new Date().getTime();
  await AsyncStorage.multiSet(writeKvs);
  res.writeMany = {
    numKeys: writeKvs.length,
    durationMs: new Date().getTime() - started,
  };

  // === readMany
  started = new Date().getTime();
  const readKvs = (await AsyncStorage.multiGet(
    await AsyncStorage.getAllKeys()
  )) as [string, string][];
  res.readMany = {
    numKeys: readKvs.length,
    durationMs: new Date().getTime() - started,
  };

  compareReadWrite(writeKvs, readKvs);
  return res as BenchmarkResults;
}

export async function benchmarkMMKV(): Promise<BenchmarkResults> {
  let res: Partial<BenchmarkResults> = {};
  const storage = new MMKV();
  storage.clearAll();
  const writeKvs: [string, string][] = benchmarkTestBedStr;
  // === writeMany
  let started = new Date().getTime();
  for (const [k, v] of writeKvs) {
    storage.set(k, v);
  }

  res.writeMany = {
    numKeys: writeKvs.length,
    durationMs: new Date().getTime() - started,
  };

  // === readMany
  const readKvs: [string, string][] = [];
  started = new Date().getTime();
  const allKeys = storage.getAllKeys();

  for (const k of allKeys) {
    const value = storage.getString(k);
    readKvs.push([k, value as string]);
  }

  res.readMany = {
    numKeys: readKvs.length,
    durationMs: new Date().getTime() - started,
  };

  compareReadWrite(writeKvs, readKvs);

  return new Promise((resolve) => {
    resolve(res as BenchmarkResults);
  });
}

export const BenchmarkResultsView = (
  x: BenchmarkResults & { title: string }
) => {
  const { writeMany, readMany, title } = x;
  const writeManyRes =
    writeMany &&
    `wrote ${writeMany.numKeys} items in ${writeMany.durationMs}ms; ` +
      `(${(writeMany.numKeys / writeMany.durationMs).toFixed(1)}items/ms)`;
  const readManyRes =
    readMany &&
    `read ${readMany.numKeys} items in ${readMany.durationMs}ms; ` +
      `(${(readMany.numKeys / readMany.durationMs).toFixed(1)}items/ms)`;

  return (
    <>
      <Text>== {title}</Text>
      <Text>Benchmark write many: {writeManyRes}</Text>
      <Text>Benchmark read many: {readManyRes}</Text>
    </>
  );
};
