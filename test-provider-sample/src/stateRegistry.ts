import { TestRunState, TestState } from 'vscode';

/**
 * Utility class used in the state registry.
 */
class StateValue {
  private readonly listeners = new Set<(v: TestState) => void>();
  private _value = StateRegistry.unsetState;

  public get value() {
    return this._value;
  }

  public set value(value: TestState) {
    this._value = value;
    for (const listener of this.listeners) {
      listener(value);
    }
  }

  public addListener(l: (v: TestState) => void) {
    this.listeners.add(l);
    return this.listeners.size;
  }

  public removeListener(l: (v: TestState) => void) {
    this.listeners.delete(l);
    return this.listeners.size;
  }
}

/**
 * Singleton used to share state internally between tests in text files and
 * those in the workspace.
 */
class StateRegistry {
  public static unsetState = new TestState(TestRunState.Unset);

  private readonly values = new Map<string, StateValue>();

  public current(id: string) {
    return this.values.get(id)?.value ?? StateRegistry.unsetState;
  }

  public update(id: string, value: TestState) {
    const record = this.values.get(id);
    if (record && record.value !== value) {
      record.value = value;
    }
  }

  public listen(id: string, l: (v: TestState) => void) {
    let value = this.values.get(id);
    if (!value) {
      value = new StateValue();
      this.values.set(id, value);
    }

    value.addListener(l);
    return {
      dispose: () => {
        if (value!.removeListener(l) === 0) {
          this.values.delete(id);
        }
      },
    };
  }
}

export const states = new StateRegistry();
