<docs>
---
title: 基本使用
---

Tooltip组件的基本使用
</docs>

<script lang="ts" setup>
import { Button as CButton, Tooltip as CTooltip } from '@chaosgods/ui'
</script>

<template>
  <div>
    <CTooltip content="这是一个tooltip">
      <CButton>基本使用</CButton>
    </CTooltip>
  </div>
</template>
