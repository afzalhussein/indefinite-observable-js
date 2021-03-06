/** @license
 *  Copyright 2016 - present The Material Motion Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not
 *  use this file except in compliance with the License. You may obtain a copy
 *  of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 *  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 *  License for the specific language governing permissions and limitations
 *  under the License.
 */

import $$observable from 'symbol-observable';

import wrapWithObserver from './wrapWithObserver';

import {
  Connect,
  Disconnect,
  Observable,
  ObserverOrNext,
  Subscription,
} from './types';

/**
 * `Observable` is a standard interface that's useful for modeling multiple,
 * asynchronous events.
 *
 * `IndefiniteObservable` is a minimalist implementation of a subset of the TC39
 * Observable proposal.  It is indefinite because it will never call `complete`
 * or `error` on the provided observer.
 */
export class IndefiniteObservable<T> implements Observable<T> {
  private _connect: Connect<T>;

  /**
   * The provided function should receive an observer and connect that
   * observer's `next` method to an event source (for instance,
   * `element.addEventListener('click', observer.next)`).
   *
   * It must return a function that will disconnect the observer from the event
   * source.
   */
  constructor(connect: Connect<T>) {
    this._connect = connect;
  }

  /**
   * `subscribe` uses the function supplied to the constructor to connect an
   * observer to an event source.  Each observer is connected independently:
   * each call to `subscribe` calls `connect` with the new observer.
   *
   * To disconnect the observer from the event source, call `unsubscribe` on the
   * returned subscription.
   *
   * Note: `subscribe` accepts either a function or an object with a
   * next method.
   */
  subscribe(observerOrNext: ObserverOrNext<T>): Subscription {
     // For simplicity's sake, `subscribe` accepts `next` either as either an
     // anonymous function or wrapped in an object (the observer).  Since
     // `connect` always expects to receive an observer, wrap any loose
     // functions in an object.
    const observer = wrapWithObserver<T>(observerOrNext);

    let disconnect: Disconnect | undefined = this._connect(observer);

    return {
      unsubscribe() {
        if (disconnect) {
          disconnect();
          disconnect = undefined;
        }
      }
    };
  }

  /**
   * Tells other libraries that know about observables that we are one.
   *
   * https://github.com/tc39/proposal-observable#observable
   */
  [$$observable](): Observable<T> {
    return this;
  }
}
export default IndefiniteObservable;
