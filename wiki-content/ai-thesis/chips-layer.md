---
title: "The Chips Layer"
description: "How GPUs became the dominant compute unit for AI workloads, and why Nvidia's CUDA ecosystem creates deep, self-reinforcing lock-in."
---

GPUs are built for parallel computation — executing thousands of operations simultaneously. This is fundamentally different from CPUs, which handle tasks sequentially. The architecture that was originally designed for rendering graphics turned out to be ideally suited for AI workloads: training models, running inference, and scientific computing.

## Why Nvidia Dominates

Nvidia's dominance at the chips layer comes not just from hardware but from **CUDA**, the software ecosystem that developers build on. CUDA is a parallel computing platform and programming model that allows developers to use Nvidia GPUs for general-purpose processing.

CUDA creates lock-in. The switching costs are enormous because the entire toolchain — libraries, frameworks, debugging tools, and developer expertise — is built around it. When a machine learning engineer writes code, they write it for CUDA. When a company trains a model, the infrastructure assumes CUDA. This is not a hardware advantage that can be competed away with a better chip; it is an ecosystem advantage that compounds over time.

Hardware specifications can be matched or exceeded by competitors. A software ecosystem with millions of developers, thousands of optimised libraries, and deep integration into every major AI framework cannot be replicated quickly. CUDA is Nvidia's true moat.

## The Critical Supply Chain

The relationship between three companies forms the backbone of AI chip production:

- **Nvidia** designs the GPU architectures
- **TSMC** (Taiwan Semiconductor Manufacturing Company) fabricates the physical chips
- **ASML** builds the extreme ultraviolet (EUV) lithography machines that TSMC requires to manufacture at leading-edge process nodes

Each company occupies a near-monopoly position in its respective link of the chain. This concentration creates both extraordinary value and supply chain risk.

Understanding the Nvidia-TSMC-ASML triad is essential. Disruption at any point — whether from geopolitical tension, capacity constraints, or technology transitions — ripples through the entire AI hardware stack.

## Related

- [AI Stack Framework](/ai-thesis/ai-stack-framework/) — The five-layer model for where value accumulates in AI
- [The Infrastructure Layer](/ai-thesis/infrastructure-layer/) — The hyperscalers that buy and deploy these chips at scale
- [Inference Scaling](/ai-thesis/inference-scaling/) — How growing inference demand drives ongoing GPU requirements
