import { NLPResultCache } from './NLPResultCache';
import { Logger } from '@shared/utils/Logger';
import { IChromeStorage } from './ChromeStorage';
import { mock, instance, when, verify } from 'ts-mockito';
import { NLPResultCacheListenerInterface } from './NLPResultCacheListener';
import { NLPResultCacheData } from './NLPResultCacheData';

const logger = new Logger();

const chromeGet = {
  get: jest.fn(
    (key) =>
      new Promise((resolve) => {
        if (key === 'NLP_VERSION') return resolve('1.0');
        if (key === 'SK_GMAIL.USER_CLEAN') return resolve('abc|def');
        if (key === 'SK_GMAIL.USER_TOXIC') return resolve('ghi|jkl');
        if (key === 'SK_GMAIL.CLEAN') return resolve('mno|pqr');
        if (key === 'SK_GMAIL.TOXIC') return resolve('stu|vwx');
      }),
  ),
  set: jest.fn(() => new Promise(() => {})),
} as IChromeStorage;

class TestStorage implements IChromeStorage {
  map = new Map<string, string | undefined>();

  async get(key: string): Promise<string | undefined> {
    const val = this.map.get(key);
    console.log(`get ${key}=${val}`);
    return new Promise((resolve) => resolve(val));
  }

  async set(key: string, val: string): Promise<void> {
    console.log(`set ${key}=${val}`);
    this.map.set(key, val);
    return Promise.resolve();
  }
}

describe('background => NLPResultCache.load with version update', () => {
  test('load-isToxic', async () => {
    const storage = new TestStorage();
    await storage.set('SK_GMAIL.USER_CLEAN', 'abc|def');
    await storage.set('SK_GMAIL.USER_TOXIC', 'ghi|jkl');
    await storage.set('SK_GMAIL.TOXIC', 'stu|vwx');
    await storage.set('SK_GMAIL.CLEAN', 'mno|pqr');
    await storage.set('NLP_VERSION', '1.0');

    const cache = await new NLPResultCache(logger, storage, '2.0');
    await cache.load();
    cache.stopInterval();
    expect(cache.isToxic('abc')).toBe(false);
    expect(cache.isToxic('def')).toBe(false);
    expect(cache.isToxic('ghi')).toBe(true);
    expect(cache.isToxic('jkl')).toBe(true);

    expect(cache.isToxic('vwx')).toBe(false);
    expect(cache.isToxic('stu')).toBe(false);
    expect(cache.isToxic('mno')).toBe(false);
    expect(cache.isToxic('pqr')).toBe(false);
  });
});

describe('background => NLPResultCache.load without version update', () => {
  test('load success', async () => {
    const mockListener = mock<NLPResultCacheListenerInterface>();
    mockListener.onCacheLoadSuccess = jest.fn((a: NLPResultCacheData) => {
      expect(a.isToxic('mno')).toBe(false);
      expect(a.isToxic('stu')).toBe(true);
    });

    jest.spyOn(mockListener, 'onCacheLoadSuccess');
    const cache = await new NLPResultCache(logger, chromeGet, '1.0', [
      mockListener,
    ]);
    await cache.load();
    cache.stopInterval();

    expect(cache.isToxic('abc')).toBe(false);
    expect(cache.isToxic('def')).toBe(false);
    expect(cache.isToxic('mno')).toBe(false);
    expect(cache.isToxic('pqr')).toBe(false);

    expect(cache.isToxic('stu')).toBe(true);
    expect(cache.isToxic('vwx')).toBe(true);
    expect(cache.isToxic('ghi')).toBe(true);
    expect(cache.isToxic('jkl')).toBe(true);

    expect(mockListener.onCacheLoadSuccess).toHaveBeenCalledTimes(1);
  });

  test('load error', async () => {
    const chromeGet = {
      get: jest.fn(
        () =>
          new Promise((resolve, reject) => {
            reject(new Error('test error'));
          }),
      ),
      set: jest.fn(() => new Promise(() => {})),
    } as IChromeStorage;
    const mockListener = mock<NLPResultCacheListenerInterface>();

    mockListener.onCacheLoadFail = jest.fn((a: Error) => {
      expect(a).toStrictEqual(new Error('test error'));
    });

    jest.spyOn(mockListener, 'onCacheLoadFail');
    const cache = await new NLPResultCache(logger, chromeGet, '1.0', [
      mockListener,
    ]);
    await cache.load();
    cache.stopInterval();

    expect(mockListener.onCacheLoadFail).toHaveBeenCalledTimes(1);
  });

  test('load-isToxic', async () => {
    const cache = await new NLPResultCache(logger, chromeGet, '1.0');
    await cache.load();
    cache.stopInterval();

    expect(cache.isToxic('abc')).toBe(false);
    expect(cache.isToxic('def')).toBe(false);
    expect(cache.isToxic('mno')).toBe(false);
    expect(cache.isToxic('pqr')).toBe(false);

    expect(cache.isToxic('stu')).toBe(true);
    expect(cache.isToxic('vwx')).toBe(true);
    expect(cache.isToxic('ghi')).toBe(true);
    expect(cache.isToxic('jkl')).toBe(true);
  });

  test('load-isClean', async () => {
    const cache = await new NLPResultCache(logger, chromeGet, '1.0');
    await cache.load();
    cache.stopInterval();
    expect(cache.isClean('abc')).toBe(true);
    expect(cache.isClean('def')).toBe(true);
    expect(cache.isClean('mno')).toBe(true);
    expect(cache.isClean('pqr')).toBe(true);

    expect(cache.isClean('stu')).toBe(false);
    expect(cache.isClean('vwx')).toBe(false);
    expect(cache.isClean('ghi')).toBe(false);
    expect(cache.isClean('jkl')).toBe(false);
  });
});

describe('background => NLPResultCache.add', () => {
  test('addUserToxic', async () => {
    const cache = await new NLPResultCache(logger, chromeGet, '1.0');
    await cache.load();
    cache.stopInterval();
    cache.addUserToxic('ABCDEFG');

    expect(cache.isToxic('ABCDEFG')).toBe(true);
    expect(cache.isClean('ABCDEFG')).toBe(false);
  });

  test('addToxic', async () => {
    const cache = await new NLPResultCache(logger, chromeGet, '1.0');
    await cache.load();
    cache.stopInterval();
    cache.addToxic('BCDEFGHIJK');

    expect(cache.isToxic('BCDEFGHIJK')).toBe(true);
    expect(cache.isClean('BCDEFGHIJK')).toBe(false);
  });
});

describe('background => NLPResultCache.remove', () => {
  test('removeAll', async () => {
    const cache = await new NLPResultCache(logger, chromeGet, '1.0');
    await cache.load();
    cache.stopInterval();

    cache.addUserToxic('IJKHDTSHD');
    expect(cache.isToxic('IJKHDTSHD')).toBe(true);
    cache.removeAll('IJKHDTSHD');
    expect(cache.isToxic('IJKHDTSHD')).toBe(false);
  });
});
