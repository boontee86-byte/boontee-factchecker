---
title: "Jevons Paradox in AI"
description: "How efficiency improvements in AI — cheaper models, lower inference costs — lead to more compute demand, not less, mirroring a 19th-century observation about coal consumption."
---

In the 19th century, economist William Stanley Jevons observed that improvements in coal-burning engine efficiency led to **more** coal consumption, not less. The logic was counterintuitive but powerful: when something becomes cheaper and more accessible, demand expands beyond what efficiency gains save. More efficient engines made coal-powered machinery economical for a far wider range of applications, and total consumption increased.

## Applied to AI

The same dynamic applies to AI compute. Cheaper models do not mean less GPU demand — they mean more AI adoption. Consider the current state:

- The cost of AI services today is still too high for the technology to penetrate every industry
- Many potential use cases are not yet economically viable at current pricing
- Every efficiency gain that makes AI cheaper accelerates the journey toward mass adoption
- More users and more organisations adopting AI means more infrastructure demand in aggregate

The path is clear: efficiency gains expand the addressable market faster than they reduce per-unit resource consumption.

Efficiency gains reduce the cost per unit of AI compute. Lower cost per unit makes AI viable for more use cases. More use cases drive total demand higher than it was before the efficiency gain. The net effect is increased — not decreased — demand for compute infrastructure.

## The DeepSeek Moment

When DeepSeek demonstrated cheaper model training techniques, markets panicked. The conclusion drawn was that GPU demand would fall — if models could be trained more cheaply, less hardware would be needed. This conclusion was wrong on two counts:

1. **Efficiency gains accelerate adoption.** Cheaper training and inference makes AI accessible to more organisations and viable for more tasks. Total compute demand increases.
2. **The headline training cost was misleading.** The reported cost reflected only the final training run, not the full research cost including all the experimentation, failed runs, and iteration that preceded it.

The DeepSeek sell-off illustrated a recurring pattern: markets sometimes interpret efficiency improvements as demand destruction rather than demand expansion. Understanding Jevons Paradox provides a framework for recognising when this misinterpretation creates opportunity.

## Related

- [The Chips Layer](/ai-thesis/chips-layer/) — Why GPU demand persists and grows despite efficiency gains
- [Inference Scaling](/ai-thesis/inference-scaling/) — Falling inference costs and expanding usage patterns
- [AI Stack Framework](/ai-thesis/ai-stack-framework/) — The broader framework for understanding AI value creation
