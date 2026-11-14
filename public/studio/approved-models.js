/* Explicit WebLLM model IDs backed by Nous Research's Hermes 3 release. */
(function () {
  const ids = new Set([
    'Hermes-3-Llama-3.1-8B-q4f16_1-MLC',
    'Hermes-3-Llama-3.1-8B-q4f32_1-MLC',
  ]);
  window.RandomAIApprovedModels = Object.freeze({allows: id => ids.has(id)});
})();
