---
name: ui-to-vue
description: Use when the user has UI screenshots or design exports that need batch conversion into Vue 3 components, especially with Vant, Element Plus, or Ant Design Vue.
metadata:
  origin: community
---

# UI To Vue

Batch-convert UI design screenshots into Vue 3 Composition API component code.

## When to Use

- The user provides a directory of design screenshots or design-export images.
- The target application is Vue 3.
- The user wants a first pass of page components, shared components, and router wiring.
- The user specifies Vant, Element Plus, or Ant Design Vue as the component library.

## When Not to Use

- The user has only one screenshot and wants a bespoke component.
- The target project is not Vue.
- The design requires detailed interaction logic, data flow, or accessibility review.
- The screenshots contain private customer data that cannot be sent to an external model API.

## CLI Usage

Run the converter with `npx`:

```bash
export DASHSCOPE_API_KEY=your_key
npx ui-to-vue-converter@1.0.2 --input ./screenshots --ui vant --output ./src
```

For desktop UI libraries:

```bash
npx ui-to-vue-converter@1.0.2 --input ./designs --ui element-plus --output ./src
npx ui-to-vue-converter@1.0.2 --input ./designs --ui antd-vue --output ./src
```

## Options

| Option | Description | Default |
| --- | --- | --- |
| `--input` | Design image directory | `./screenshots` |
| `--ui` | UI library: `vant`, `element-plus`, or `antd-vue` | `vant` |
| `--output` | Output directory | `./src` |
| `--config` | Config file path | `./.ui-to-vue.config.json` |
