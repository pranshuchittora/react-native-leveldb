![React Native LevelDB](./docs/RNLevelDB-Cover.png)

# Fastest KV store for React Native

Superfast React Native bindings for LevelDB:

- 2-7x faster than AsyncStorage or react-native-sqlite-storage - try the benchmarks under example/!
- completely synchronous, blocking API (even on slow devices, a single read or write takes 0.1ms)
- use it with Flatbuffers to turbo charge your app - support for binary data via ArrayBuffers

## Sponsored by

<a href="https://green-triangle.com/">
  <img src="https://www.green-triangle.com/wp-content/uploads/2021/04/Logo-300x66.png" alt-text="Green Triangle logo" />
</a>

## Installation

```sh
yarn add react-native-leveldb
```

> Make sure you update your <kbd>Pods</kbd> by running `pod install`.

## Usage

```ts
import { LevelDB } from 'react-native-leveldb';

// Open a potentially new database.
const name = 'example.db';
const createIfMissing = true;
const errorIfExists = false;

const db = new LevelDB(name, { createIfMissing, errorIfExists });

// Insert something into the database. Note that the key and the
// value can either be strings or ArrayBuffers.

// Strings are read & written in utf8.
db.put('key', 'value');

// You can also use ArrayBuffers as input, containing binary data.
const key = new Uint8Array([1, 2, 3]);
const value = new Uint32Array([654321]);
db.put(key.buffer, value.buffer);

// Get values as string or as an ArrayBuffer (useful for binary data).
const readStringValue = db.getStr('key');
const readBufferValue = new Uint32Array(db.getBuf(key.buffer)!);
console.log(readStringValue, readBufferValue); // logs: value [654321]

// Iterate over a range of values (here, from key "key" to the end.)
let iter = db.newIterator();
for (iter.seek('key'); iter.valid(); iter.next()) {
  // There are also *Buf version to access iterators' keys & values.
  console.log(`iterating: "${iter.keyStr()}" / "${iter.valueStr()}"`);
}

// You need to close iterators when you are done with them.
// Iterators will throw an error if used after this.
iter.close();

db.close(); // Same for databases.
```

## API

### new LevelDB(path)

Creates a new LevelDB instance.

Options

1. <kbd>path</kbd> : Name/Path of the LevelDB database.
2. <kbd>options</kbd> (optional) : Object to define options for LevelDB database.
    - <kbd>createIfMissing</kbd>: Boolean value to create a new DB if not exists. Defaults to `true`.
    - <kbd>errorIfExists</kbd>: Throws and error if a database with the same name already exists. Defaults to `false`.
    - <kbd>compression</kbd>: Boolean to enable or disable compression. Defaults to `true`.

```ts
const userPreferences = new LevelDB('user-preferences.db');
```

### put(key, value)

Sets the value for the given key.

- <kbd>key</kbd>- `ArrayBuffer | string`.
- <kbd>value</kbd> - `ArrayBuffer | string`.

```ts
const userPreferences = new LevelDB('user-preferences.db');

userPreferences.put('theme', 'dark');
```

### get(key)

Gets the value for the given key.

- <kbd>key</kbd> - `ArrayBuffer | string`.

```ts
const userPreferences = new LevelDB('user-preferences.db');

userPreferences.put('theme', 'dark');
userPreferences.get('theme'); // 'dark'
```

### delete(key)

Deletes the value for the given key.

- <kbd>key</kbd> - `ArrayBuffer | string`.

```ts
const userPreferences = new LevelDB('user-preferences.db');

userPreferences.delete('theme');
```

### close

Closes the database.

```ts
const userPreferences = new LevelDB('user-preferences.db');

userPreferences.close();
```

### closed

Returns true if the database reference is closes.

```ts
const userPreferences = new LevelDB('user-preferences.db');

userPreferences.closed(); // false
userPreferences.close();
userPreferences.closed(); // true
```

### destroyDB(path, force)

Deletes the database from the filesystem.
`destroyDB` is a static method.

- <kbd>path</kbd> - `string` : Path/Name of the database.
- <kbd>force</kbd> (optional) - `boolean` : Forcefully destroys the database by closing it, if required.

> `Error: DB is open! Cannot destroy` : Make sure you close the database before destroying it. Or use the <kbd>force</kbd> flag

```ts
LevelDB.destroyDB('user-preferences.db');
```

### TODO: Add docs for iterator

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
