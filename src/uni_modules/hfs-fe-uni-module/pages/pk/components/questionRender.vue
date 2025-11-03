<template>
  <view class="question" :style="customStyle">
    <QuestionItem :item="question.item1" :is-fraction="isFraction" />
    <slot v-if="isCompare" :props="{ isCompare }" />
    <view v-else-if="notation" class="question-calculate">
      {{ notation }}
    </view>
    <QuestionItem :item="question.item2" :is-fraction="isFraction" />
    <template v-if="!isCompare">
      <view class="question-calculate">
        =
      </view>
      <slot :props="{ isCompare }" />
    </template>
  </view>
</template>

<script>
import questionItem from './questionItem.vue'

export default {
  components: { QuestionItem: questionItem },
  props: {
    question: {
      type: Object,
      default: () => ({}),
    },
    customStyle: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      calculate: {
        add: '+',
        minus: '-',
        multiply: 'x',
        divide: '÷',
      },
    }
  },
  computed: {
    isCompare() {
      return this.question.calculate === 'compare'
    },
    isFraction() {
      return this.question.numType === 2
    },
    notation() {
      return this.calculate[this.question.calculate]
    },
  },
}
</script>

<style lang="scss" scoped>
.question {
  display: flex;
  align-items: center;
  justify-content: center;
  &-calculate {
    margin: 0 0.2em;
  }
}
</style>
