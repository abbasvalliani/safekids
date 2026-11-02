import {NLP} from '@safekids-ai/nlp-js-common';
import { InferenceSession } from "onnxruntime-react-native";
import type { InferenceSession as CommonInferenceSession } from "onnxruntime-common";
class NLPWeb extends NLP {
  constructor(modelUrl: string) {
    super(modelUrl);
  }

  // onnxruntime-react-native bundles an older onnxruntime-common than the one
  // NLP is typed against; the session object is the same at runtime.
  public createSession(modelUrl: string): Promise<CommonInferenceSession> {
    return InferenceSession.create(modelUrl, {graphOptimizationLevel: 'all'}) as unknown as Promise<CommonInferenceSession>;
  }
}

export { NLPWeb}
