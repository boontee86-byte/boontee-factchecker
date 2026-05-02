---
title: "Inference Scaling"
description: "Why inference — running trained models to serve user requests — is where AI's recurring revenue will come from, and the dynamics driving its growth."
---

Inference — running trained models to serve user requests — is where AI's recurring revenue will come from. Training a model is a large, periodic cost. Serving that model to millions of users is an ongoing, scalable revenue stream.

## Key Dynamics

### Rapidly Falling Costs

Inference costs are falling approximately 90% per year. This dramatic cost reduction is driven by hardware improvements, software optimisation, model distillation, and architectural innovation. The pace of cost reduction is extraordinary even by technology industry standards.

### Growth Over Margin (For Now)

AI companies are currently passing cost savings to users as lower prices, prioritising growth over margin. This is a deliberate strategic choice: expand the user base and embed AI into workflows while costs are falling, then capture margin as the market matures and switching costs increase.

### Scaling With User Growth

As the inference business scales with user growth, it will become the dominant revenue driver for AI companies. Every new user, every new application, every new workflow that incorporates AI generates inference demand. The revenue compounds as adoption deepens.

### Test-Time Compute

The shift from one-shot prompting to test-time compute — models "thinking longer" on harder problems — means more compute cycles per query, not fewer. When a model reasons through a complex problem step by step, it consumes significantly more inference compute than a simple response. This dynamic pushes per-query compute consumption upward even as per-unit costs fall.

This is analogous to how cloud computing evolved. Infrastructure costs fell steadily, usage expanded dramatically, and the platforms became enormously profitable over time. Early cloud sceptics focused on falling per-unit prices and missed the exponential growth in total usage. The same dynamic is playing out with AI inference.

## The Large-Scale Provider Advantage

The economics of inference will eventually favour large-scale providers with the infrastructure already in place. Running inference efficiently requires:

- Massive GPU clusters with high utilisation rates
- Sophisticated orchestration and load balancing
- Global distribution for low-latency serving
- The capital to invest continuously in next-generation hardware

These requirements naturally favour the hyperscalers and established AI companies that have already built this infrastructure at scale.

Inference is the recurring revenue engine of AI. Companies positioned to serve inference at scale — with the infrastructure, customer relationships, and capital to maintain their position — are the primary beneficiaries of AI adoption growth regardless of which specific models or applications win.

## Related

- [The Infrastructure Layer](/ai-thesis/infrastructure-layer/) — The hyperscalers building the infrastructure inference runs on
- [Jevons Paradox in AI](/ai-thesis/jevons-paradox/) — Why falling inference costs drive more demand, not less
- [The Models Layer](/ai-thesis/models-layer/) — How frontier model companies are building inference-driven revenue
