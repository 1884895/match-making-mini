<template>
  <view class="play">
    <view class="play-bg">
      <image class="play-bg__header" :src="`${resourceUrl}header_bg.png`" mode="widthFix" />
      <image class="play-bg__hot" :src="`${resourceUrl}heartbeat.png`" />
    </view>
    <view class="play-content">
      <view class="play-content__info">
        <view class="cart">
          <view class="cart-bg">
            <image class="cart-bg__ribbon" :src="`${resourceUrl}ribbon.png`" mode="widthFix" />
            <image v-if="grade !== '0'" class="cart-bg__cart" :src="`${resourceUrl}cart_small.png`" mode="widthFix" />
            <image v-else class="cart-bg__cart" :src="`${resourceUrl}cart_big.png`" mode="widthFix" />
          </view>
          <view class="cart-list">
            <view v-for="(item, index) in goods" :key="index" class="cart-list__item">
              <image class="floor" :src="`${resourceUrl}floor.png`" mode="heightFix" />
              <image v-if="grade !== '0'" class="floor right" :src="`${resourceUrl}floor.png`" mode="heightFix" />
              <view class="tag">
                <template v-if="grade !== '0'">
                  <image v-if="tagsList[index]" class="tag-icon" :src="resourceUrl + tagsList[index]" />
                </template>
                <view v-else class="tag-text">
                  {{ item.discount }}折
                </view>
              </view>
              <view class="content">
                <view class="content-name">
                  {{ item.name }}
                </view>
                <view class="content-price" :class="{ active: grade !== '0' }">
                  <view class="content-price__now">
                    ¥<text class="active">
                      {{ item.cost }}
                    </text>
                  </view>
                  <view v-if="grade === '0'" class="content-price__old">
                    日常价：<text class="active">
                      ￥360
                    </text>
                  </view>
                </view>
                <view v-if="grade !== '0'" class="content-tips">
                  {{ tipsList[index] || '' }}
                </view>
                <view v-else class="content-discount">
                  <image class="content-discount__icon" :src="`${resourceUrl}descent.png`" mode="heightFix" />
                  <view class="content-discount__text">
                    <view class="text">
                      直降
                    </view>
                    <view class="minus">
                      {{ item.minus }}元
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="payment">
          <Payment :page-type="pageType" :group-info="groupInfo" :open-group-info="openGroupInfo" :payment-info="paymentInfo" :is-play="true" />
        </view>
        <view class="desc">
          <view class="desc-title">
            特别说明：
          </view>
          <view class="desc-text">
            1. 用户若有学币，下单可抵扣
          </view>
          <view class="desc-text">
            2. 72h拼团计时结束，按达成人数核算成团价，差额72h后原路返回
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Payment from './payment.vue'

export default {
  options: {
    styleIsolation: 'shared',
  },
  components: { Payment },
  props: {
    pageType: {
      type: String,
      default: '',
    },
    groupInfo: {
      type: Object,
      default: () => {},
    },
    openGroupInfo: {
      type: Object,
      default: () => {},
    },
    paymentInfo: {
      type: Object,
      default: () => {},
    },
    grade: {
      type: String,
      default: '0',
    },
  },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/group/',
      tipsList: ['巨划算', '省得多', '享特价'],
      tagsList: ['play_tag_1.png', 'play_tag_2.png', 'play_tag_3.png'],
    }
  },
  computed: {
    goods() {
      const goods = JSON.parse(JSON.stringify(this.groupInfo.goods || []))
      return goods.reverse()
    },
  },
}
</script>

<style lang="scss" scoped>
.play {
  position: relative;
  margin: -40rpx 28rpx 24rpx;
  &-bg {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    &__header {
      width: 100%;
    }
    &__hot {
      width: 408rpx;
      height: 52rpx;
      position: absolute;
      left: 50%;
      top: 24rpx;
      transform: translateX(-50%);
    }
  }
  &-content {
    position: relative;
    border-radius: 24rpx;
    padding-top: 104rpx;
    z-index: 1;
    &__info {
      background: #fff;
      border-radius: 24rpx;
    }
    .cart {
      position: relative;
      width: 100%;
      margin-bottom: 24rpx;
      &-bg {
        &__ribbon {
          width: 544rpx;
          margin: 0 auto;
        }
        &__cart {
          width: 654rpx;
          margin-top: -107rpx;
        }
      }
      &-list {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding-top: 80rpx;
        &__item {
          position: relative;
          border-radius: 16rpx;
          margin: 0 auto 12rpx;
          .floor {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            &.right {
              left: auto;
              right: 0;
              transform: rotate(180deg);
            }
          }
          .tag {
            position: absolute;
            right: 0;
            top: 0;
            display: flex;
            justify-content: center;
            background: linear-gradient(
              45deg,
              transparent,
              transparent 50%,
              #ffe968 50%,
              #ffe968 100%
            );
            border-radius: 0 16rpx 0 0;
            &-icon {
              width: 80rpx;
              height: 80rpx;
              position: absolute;
              right: 0;
              top: 0;
            }
            &-text {
              font-family: YEFONTAoYeHei;
              color: #444400;
              transform: rotate(45deg);
              margin-top: 6rpx;
            }
          }
          .content {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            &-name {
              font-family: YEFONTAoYeHei;
              color: #333333;
            }
            &-price {
              color: #ffffff;
              &__now {
                margin-right: 2rpx;
                .active {
                  font-family: YEFONTAoYeHei;
                }
              }
              &__old {
                .active {
                  text-decoration: line-through;
                }
              }
            }
            &-discount {
              position: relative;
              height: 100%;
              &__icon {
                height: 100%;
              }
              &__text {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                color: #ffffff;
                display: flex;
                flex-direction: column;
                justify-content: center;
                transform: rotate(7deg);
                padding-left: 20rpx;
                .minus {
                  font-family: YEFONTAoYeHei;
                }
              }
            }
            &-tips {
              font-family: YEFONTAoYeHei;
              color: #df3636;
              font-size: 30rpx;
            }
          }
          &:nth-child(1) {
            width: 560rpx;
            height: 124rpx;
            background: #ff9040;
            .tag {
              width: 70rpx;
              height: 66rpx;
              &-text {
                font-size: 20rpx;
              }
            }
            .content {
              padding-left: 44rpx;
              &-name {
                font-size: 24rpx;
                &::first-letter {
                  font-size: 50rpx;
                }
              }
              &-price {
                margin-left: 74rpx;
                &__now {
                  font-size: 28rpx;
                  line-height: 55rpx;
                  .active {
                    font-size: 58rpx;
                  }
                }
                &__old {
                  font-size: 22rpx;
                  line-height: 28rpx;
                  .active {
                    font-size: 24rpx;
                  }
                }
                &.active {
                  margin-left: 68rpx;
                  .content-price__now {
                    font-size: 34rpx;
                    line-height: 1;
                    .active {
                      font-size: 70rpx;
                    }
                  }
                }
              }
              &-discount {
                margin-left: 32rpx;
                &__text {
                  .text {
                    font-size: 22rpx;
                  }
                  .minus {
                    font-size: 30rpx;
                  }
                }
              }
              &-tips {
                margin-left: 22rpx;
              }
            }
          }
          &:nth-child(2) {
            width: 532rpx;
            height: 116rpx;
            background: #ffa767;
            .tag {
              width: 66rpx;
              height: 62rpx;
              &-text {
                font-size: 19rpx;
              }
            }
            .content {
              padding-left: 40rpx;
              &-name {
                font-size: 24rpx;
                &::first-letter {
                  font-size: 48rpx;
                }
              }
              &-price {
                margin-left: 66rpx;
                &__now {
                  font-size: 28rpx;
                  line-height: 49rpx;
                  .active {
                    font-size: 54rpx;
                  }
                }
                &__old {
                  font-size: 20rpx;
                  line-height: 28rpx;
                  .active {
                    font-size: 22rpx;
                  }
                }
                &.active {
                  margin-left: 62rpx;
                  .content-price__now {
                    font-size: 32rpx;
                    line-height: 1;
                    .active {
                      font-size: 66rpx;
                    }
                  }
                }
              }
              &-discount {
                margin-left: 36rpx;
                &__text {
                  .text {
                    font-size: 20rpx;
                  }
                  .minus {
                    font-size: 28rpx;
                  }
                }
              }
              &-tips {
                margin-left: 26rpx;
              }
            }
          }
          &:nth-child(3) {
            width: 504rpx;
            height: 112rpx;
            background: #ffba89;
            .tag {
              width: 64rpx;
              height: 60rpx;
              &-text {
                font-size: 18rpx;
              }
            }
            .content {
              padding-left: 36rpx;
              &-name {
                font-size: 22rpx;
                &::first-letter {
                  font-size: 46rpx;
                }
              }
              &-price {
                margin-left: 64rpx;
                &__now {
                  font-size: 26rpx;
                  line-height: 47rpx;
                  .active {
                    font-size: 52rpx;
                  }
                }
                &__old {
                  font-size: 20rpx;
                  line-height: 28rpx;
                  .active {
                    font-size: 22rpx;
                  }
                }
                &.active {
                  margin-left: 62rpx;
                  .content-price__now {
                    font-size: 32rpx;
                    line-height: 1;
                    .active {
                      font-size: 62rpx;
                    }
                  }
                }
              }
              &-discount {
                margin-left: 34rpx;
                &__text {
                  .text {
                    font-size: 20rpx;
                  }
                  .minus {
                    font-size: 26rpx;
                  }
                }
              }
              &-tips {
                margin-left: 20rpx;
              }
            }
          }
          &:nth-child(4) {
            width: 476rpx;
            height: 106rpx;
            background: #ffc8a0;
            .tag {
              width: 60rpx;
              height: 56rpx;
              &-text {
                font-size: 17rpx;
              }
            }
            .content {
              padding-left: 34rpx;
              &-name {
                font-size: 20rpx;
                &::first-letter {
                  font-size: 42rpx;
                }
              }
              &-price {
                margin-left: 72rpx;
                &__now {
                  font-size: 24rpx;
                  line-height: 43rpx;
                  .active {
                    font-size: 48rpx;
                  }
                }
                &__old {
                  font-size: 18rpx;
                  line-height: 28rpx;
                  .active {
                    font-size: 20rpx;
                  }
                }
              }
              &-discount {
                margin-left: 32rpx;
                &__text {
                  .text {
                    font-size: 18rpx;
                  }
                  .minus {
                    font-size: 24rpx;
                  }
                }
              }
            }
          }
        }
      }
    }
    .payment {
      padding: 0 28rpx;
      margin-bottom: 40rpx;
      ::v-deep .payment {
        position: initial !important;
        z-index: 1;
        &-checked {
          height: auto;
          background: none;
          padding: 0;
          margin-bottom: 36rpx;
        }
        &-goods {
          height: 92rpx;
          box-shadow: none;
          padding-top: 40rpx;
          &__customer {
            display: none;
          }
          &__price {
            padding: 0;
          }
        }
      }
    }
    .desc {
      padding: 0 28rpx 20rpx;
      &-title {
        font-size: 24rpx;
        font-weight: 500;
        color: #333333;
        line-height: 34rpx;
      }
      &-text {
        font-size: 18rpx;
        color: #939393;
      }
    }
  }
}
</style>
