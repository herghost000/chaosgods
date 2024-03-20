<docs>
---
title: 插槽使用
---

插槽模式使用Tooltip组件
</docs>

<script lang="ts" setup>
import { Button as CButton, Tooltip as CTooltip } from 'chaos-ui'
</script>

<template>
  <div>
    <CTooltip placement="top">
      <template #content>
        <span style="color: red">
          这是插槽中的内容
        </span>
      </template>
      <CButton>基本使用</CButton>
    </CTooltip>
  </div>
</template>
