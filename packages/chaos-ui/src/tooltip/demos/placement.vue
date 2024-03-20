<docs>
---
title: 位置
---

Tooltip组件提供了12个方向来使用。
</docs>

<script lang="ts" setup>
import { Button as CButton, Tooltip as CTooltip } from 'chaos-ui'
</script>

<template>
  <div style="display: flex;gap: 10px;flex-wrap: wrap">
    <CTooltip content="test placement">
      <CButton>Bottom</CButton>
    </CTooltip>
    <CTooltip placement="bottom-end" content="test placement">
      <CButton>BottomEnd</CButton>
    </CTooltip>
    <CTooltip placement="bottom-start" content="test placement">
      <CButton>BottomStart</CButton>
    </CTooltip>
    <CTooltip placement="top" content="test placement">
      <CButton>Top</CButton>
    </CTooltip>
    <CTooltip placement="top-start" content="test placement">
      <CButton>TopStart</CButton>
    </CTooltip>
    <CTooltip placement="top-end" content="test placement">
      <CButton>TopEnd</CButton>
    </CTooltip>
    <CTooltip placement="left" content="test placement">
      <CButton>Left</CButton>
    </CTooltip>
    <CTooltip placement="left-start" content="test placement">
      <CButton>LeftStart</CButton>
    </CTooltip>
    <CTooltip placement="left-end" content="test placement">
      <CButton>LeftEnd</CButton>
    </CTooltip>
    <CTooltip placement="right" content="test placement">
      <CButton>Right</CButton>
    </CTooltip>
    <CTooltip placement="right-start" content="test placement">
      <CButton>RightStart</CButton>
    </CTooltip>
    <CTooltip placement="right-end" content="test placement">
      <CButton>RightEnd</CButton>
    </CTooltip>
  </div>
</template>
