<docs>
---
title: 触发方式
---

Tooltip支持两种触发方式，分别是`hover`和`click`。
</docs>

<script lang="ts" setup>
import { Button as CButton, Tooltip as CTooltip } from '@chaosgods/ui'
</script>

<template>
  <div style="display: flex;gap: 10px">
    <CTooltip trigger="hover" content="test trigger">
      <CButton>hover</CButton>
    </CTooltip>
    <CTooltip trigger="click" content="test trigger">
      <CButton>点击</CButton>
    </CTooltip>
  </div>
</template>
