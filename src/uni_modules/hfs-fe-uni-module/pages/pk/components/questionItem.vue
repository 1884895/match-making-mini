<template>
  <view class="question-item">
    <template v-if="isObject && isFraction">
      <text class="numerator">
        {{ item.numerator }}
      </text>
      <text class="line" />
      <text class="denominator">
        {{ item.denominator }}
      </text>
    </template>
    <template v-else>
      {{ item }}
    </template>
  </view>
</template>

<script>
export default {
  props: {
    item: {
      type: [Object, String, Number],
      default: '',
    },
    isFraction: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isObject() {
      return uni.$u.test.object(this.item)
    },
  },
}
</script>

<style lang="scss" scoped>
.question-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .line {
    width: 100%;
    border-bottom: 0.1em solid;
    border-radius: 0.1em;
  }
}
</style>
