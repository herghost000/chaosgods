<docs>
---
title: 基本使用
---

这是一个`button`按钮最基本的使用例子
</docs>

<script setup lang="ts">
function myClick() {
  // todo
}
</script>

<template>
  <div style="display: flex;gap: 10px;">
    <CButton @click="myClick">
      按钮1
    </CButton>
    <CButton type="primary" @click="myClick">
      按钮2
    </CButton>
    <CButton type="dashed">
      按钮3
    </CButton>
  </div>
</template>
