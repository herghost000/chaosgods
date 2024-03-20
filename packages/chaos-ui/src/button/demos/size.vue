<docs>
---
title: 按钮大小
---

你可以通过设置`size`属性来改变按钮的大小，默认为`default`，可选值为`small`和`large`
</docs>

<script setup lang="ts">
import { Button as CButton } from 'chaos-ui'
</script>

<template>
  <div style="display: flex;gap: 10px">
    <CButton size="small">
      小按钮
    </CButton>
    <CButton>
      正常
    </CButton>
    <CButton size="large">
      大按钮
    </CButton>
  </div>
</template>
