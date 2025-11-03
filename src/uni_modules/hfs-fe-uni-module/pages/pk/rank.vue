<template>
  <view class="rank" :class="{ personal: rankType === 0, school: rankType === 1 }" @touchstart="hideTip">
    <image
      class="rank-bg"
      :src="`${rankBG}`"
      mode="widthFix"
    />
    <view class="container">
      <view class="header">
        <view class="header-segmented">
          <view class="segmented-control">
            <view
              v-for="(label, index) in segmentedList"
              :key="index"
              class="segmented-control-button"
              :class="{ active: rankType === index }"
              :style="{ width: '172rpx' }"
              @touchstart.stop="() => {}"
              @click="segmentedSelect(index)"
            >
              {{ label }}
            </view>
            <view
              class="segmented-control-indicator"
              :style="{ width: '168rpx', transform: `translateX(${rankType * 100}%)` }"
            />
          </view>
        </view>
        <view v-if="rankType === 0" class="header-swiper">
          <swiper class="swiper" :current="swiperCurrent" previous-margin="250rpx" next-margin="250rpx" :indicator-dots="false" :autoplay="false" @change="swiperChange">
            <swiper-item v-for="item in rankInfoList" :key="item.rank">
              <view class="swiper-item">
                <template v-if="item.rank > 0">
                  <!-- 已获得 -->
                  <template v-if="item.rank <= userInfo.rank">
                    <view class="swiper-item-content" :class="{ current: isSwipeCurrent(item) }">
                      <image
                        class="swiper-item-image"
                        :class="{ current: isSwipeCurrent(item) }"
                        :src="`${medalResourceUrl}${item.rankNormalIcon}`"
                        mode="scaleToFill"
                      />
                      <view class="swiper-item-brand" :class="{ current: isSwipeCurrent(item) }">
                        <image
                          class="image"
                          :src="`${medalResourceUrl}${item.rankNormalBrand}`"
                          mode="widthFix"
                        />
                        <text class="text">
                          {{ item.rankName }}
                        </text>
                      </view>
                    </view>
                  </template>
                  <!-- 未获得 -->
                  <template v-else>
                    <view class="swiper-item-content" :class="{ current: isSwipeCurrent(item) }">
                      <image
                        class="swiper-item-image"
                        :class="{ current: isSwipeCurrent(item) }"
                        :src="`${medalResourceUrl}${item.rankDisableIcon}`"
                        mode="scaleToFill"
                      />
                    </view>
                  </template>
                </template>
              </view>
            </swiper-item>
          </swiper>
        </view>
        <view class="header-tips" :class="{ personal: rankType === 0, school: rankType === 1 }">
          每天24点更新榜单
        </view>
      </view>
      <view class="content" :class="{ personal: rankType === 0, school: rankType === 1 }">
        <view v-if="(rankType === 0 && personalRanks.length > 0) || (rankType === 1 && schoolRanks.length > 0)" class="content-title">
          <view class="content-title-left">
            <text>{{ rankType === 0 ? '用户昵称' : '学校名称' }}</text>
          </view>
          <view class="content-title-right">
            <view class="content-title-right__score" @click.stop="showTip('score')" @touchstart.stop="() => {}">
              <text class="title">
                战力
              </text>
              <u-icon size="14" :name="`${resourceUrl}pk_rank_question_mark.png`" />
            </view>
            <view class="content-title-right__hot" @click.stop="showTip(rankType === 0 ? 'contribution' : 'hot')" @touchstart.stop="() => {}">
              <text class="title" :class="{ personal: rankType === 0, school: rankType === 1 }">
                {{ rankType === 0 ? '贡献' : '热度' }}
              </text>
              <u-icon size="14" :name="`${resourceUrl}pk_rank_question_mark.png`" />
            </view>
            <view v-if="tipsVisible" class="content-title-right__tip" :class="{ score: tipsType === 'score' }">
              <image
                class="image"
                :src="tipsSrc"
                mode="widthFix"
              />
            </view>
          </view>
        </view>
        <view v-else class="content-title" />
        <scroll-view scroll-y class="content-list" :class="{ personal: rankType === 0, school: rankType === 1 }">
          <template v-if="rankType === 0">
            <template v-if="personalRanks.length === 0">
              <view class="content-list-empty">
                <view class="content-list-empty-content">
                  <image
                    class="content-list-empty-content__image"
                    :src="`${resourceUrl}pk_rank_empty.png`"
                    mode="widthFix"
                  />
                  <view class="content-list-empty-content__text">
                    暂无榜单～
                  </view>
                </view>
              </view>
            </template>
            <template v-else>
              <view v-for="(item, index) in personalRanks" :key="item._id" class="content-list-item" :class="{ mine: item.isMine }">
                <view class="content-list-item-left">
                  <view class="content-list-item-left__index" :class="{ first: index === 0, second: index === 1, third: index === 2 }">
                    <text>{{ index + 1 }}</text>
                  </view>
                  <view v-if="rankType === 0" class="content-list-item-left__user-info">
                    <view class="avatar">
                      <image
                        class="image"
                        :src="`${medalResourceUrl}avatar.png`"
                      />
                    </view>
                    <view class="info">
                      <view class="nick">
                        {{ item.stuName || item.nickName }}
                      </view>
                      <view class="school">
                        {{ item.schoolName }}
                      </view>
                    </view>
                  </view>
                  <view v-if="rankType === 1" class="content-list-item-left__name">
                    <text>{{ item.schoolName }}</text>
                  </view>
                </view>
                <view class="content-list-item-right">
                  <view class="content-list-item-right__score">
                    <text>{{ item.score }}</text>
                  </view>
                  <view class="content-list-item-right__hot personal">
                    <text class="title personal">
                      {{ item.contributeScore }}
                    </text>
                  </view>
                </view>
              </view>
            </template>
          </template>
          <template v-if="rankType === 1">
            <template v-if="schoolRanks.length === 0">
              <view class="content-list-empty">
                <view class="content-list-empty-content">
                  <image
                    class="content-list-empty-content__image"
                    :src="`${resourceUrl}pk_rank_empty.png`"
                    mode="widthFix"
                  />
                  <view class="content-list-empty-content__text">
                    暂无榜单～
                  </view>
                </view>
              </view>
            </template>
            <template v-else>
              <view v-for="(item, index) in schoolRanks" :key="item._id" class="content-list-item" :class="{ mine: item.isMine }">
                <view class="content-list-item-left">
                  <view class="content-list-item-left__index" :class="{ first: index === 0, second: index === 1, third: index === 2 }">
                    <text>{{ index + 1 }}</text>
                  </view>
                  <view v-if="rankType === 0" class="content-list-item-left__user-info">
                    <view class="avatar" />
                    <view class="info">
                      <view class="nick" />
                      <view class="school" />
                    </view>
                  </view>
                  <view v-if="rankType === 1" class="content-list-item-left__name">
                    <text>{{ item.schoolName }}</text>
                  </view>
                </view>
                <view class="content-list-item-right">
                  <view class="content-list-item-right__score">
                    <text>{{ item.score }}</text>
                  </view>
                  <view class="content-list-item-right__hot" :class="{ personal: rankType === 0, school: rankType === 1 }">
                    <text class="title" :class="{ personal: rankType === 0, school: rankType === 1 }">
                      {{ item.hot }}
                    </text>
                  </view>
                </view>
              </view>
            </template>
          </template>
          <view class="content-list-item placeholder" />
        </scroll-view>
        <view class="content-footer">
          <view class="content-footer-button-container">
            <view class="content-footer-button-container__button" @click.stop="shareChallenge" @touchstart.stop="() => {}">
              <text class="text">
                邀请好友冲榜
              </text>
              <u-icon size="18" :name="`${resourceUrl}pk_rank_share.png`" />
            </view>
          </view>
          <view class="content-footer-placeholder" />
        </view>
      </view>
    </view>
    <Share ref="share" />
  </view>
</template>

<script>
import Share from './components/share.vue'
import { report } from '@/uni_modules/hfs-fe-uni-plugins'

const RankTypeMap = {
  personal: 0,
  school: 1,
}
export default {
  components: { Share },
  data() {
    return {
      resourceUrl: 'https://fe-resource.haofenshu.com/pk/images/rank/',
      medalResourceUrl: 'https://fe-resource.haofenshu.com/pk/images/',
      rankType: RankTypeMap.personal,
      segmentedList: ['个人榜', '学校榜'],
      tipsType: 'hot',
      tipsVisible: false,
      schoolRanks: [],
      personalRanks: [],
      rankInfoList: [],
      userInfo: {},
      swiperCurrent: 0,
    }
  },
  computed: {
    rankBG() {
      if (this.rankType === 0) {
        return `${this.resourceUrl}pk_rank_bg_personal.png`
      }
      else {
        return `${this.resourceUrl}pk_rank_bg_school.png`
      }
    },
    tipsSrc() {
      if (this.tipsType === 'score') {
        return `${this.resourceUrl}pk_rank_score_tip.png`
      }
      else if (this.tipsType === 'hot') {
        return `${this.resourceUrl}pk_rank_hot_tip.png`
      }
      else {
        return `${this.resourceUrl}pk_rank_contribution_tip.png`
      }
    },
  },
  methods: {
    async segmentedSelect(index) {
      this.hideTip()
      this.rankType = index
      if (index === RankTypeMap.personal) {
        await this.getUserInfo()
        await this.getPersonalRanks()
      }
      else {
        await this.getSchoolRanks()
      }
    },
    showTip(type) {
      if (this.tipsType === type) {
        this.tipsVisible = !this.tipsVisible
      }
      else {
        this.tipsType = type
        this.tipsVisible = true
      }
    },
    hideTip() {
      this.tipsVisible = false
    },
    async getUserInfo() {
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/pk/info`)
      this.userInfo = res.Data || {}
      this.swiperCurrent = (this.userInfo.rank === 0 || this.userInfo.rank === 1) ? 0 : this.userInfo.rank - 1
    },
    swiperChange(e) {
      this.swiperCurrent = e.detail.current
    },
    isSwipeCurrent(item) {
      return item.rank === (`${this.swiperCurrent + 1}`)
    },
    async getPersonalRanks() {
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/pk/student_rank`)
      this.personalRanks = res.Data || []
    },
    async getSchoolRanks() {
      const res = await uni.$http.get(`${feConfig.api.znyx}/api/pk/school_rank`)
      this.schoolRanks = res.Data || []
    },
    shareChallenge() {
      report('pk', 'sy_yqhycb')
      this.$refs.share.init({ type: 1, name: this.userInfo.stuName, code: 11 })
    },
  },
  onLoad(options) {
    if (options.rankType) {
      this.rankType = RankTypeMap[options.rankType]
    }
    const rankInfoList = uni.getStorageSync('rankInfoList')
    if (rankInfoList) {
      rankInfoList.shift()
      this.rankInfoList = rankInfoList
    }
    this.getUserInfo()
    this.getPersonalRanks()
  },
}
</script>

<style lang="scss" scoped>
@import './font.scss';
.rank {
  height: 100vh;

  &.personal {
    padding-top: 446rpx;
    background-color: #fcf5db;
  }

  &.school {
    padding-top: 186rpx;
    background-color: #ffcb59;
  }

  &-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
  }

  .container {
    position: fixed;
    z-index: 1;

    .header {
      overflow: hidden;
      position: fixed;
      top: 0;
      padding-top: 40rpx;
      padding-bottom: 12rpx;
      width: 100%;
      background-color: transparent;

      &-segmented {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      &-swiper {
        position: relative;
        z-index: 1;
        padding-top: 12rpx;
        width: 100%;

        .swiper {
          height: 250rpx;
          &-item {
            width: 250rpx;
            height: 250rpx;

            display: flex;
            justify-content: center;
            align-items: center;

            &-content {
              &.current {
                transform: scale(1.6);
              }
            }

            &-image {
              width: 160rpx;
              height: 160rpx;

              // &.current {
              //   width: 240rpx;
              //   height: 240rpx;
              // }
            }

            &-brand {
              position: absolute;
              top: 66%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 121rpx;
              display: flex;
              justify-content: center;
              align-items: center;

              &.current {
                top: 75%;
                left: 50%;
                transform: translate(-50%, -50%);
              }

              .image {
                width: 121rpx;
              }

              .text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                font-size: 20rpx;
                font-weight: 500;
                color: #ffffff;
                text-align: center;
              }
            }
          }
        }
      }

      &-tips {
        position: relative;
        z-index: 1;
        padding-top: 26rpx;
        margin: 0 28rpx;
        height: 68rpx;
        font-size: 28rpx;
        color: #73520e;
        background-color: transparent;

        &.personal {
          padding-top: 10rpx;
        }
      }

      .segmented-control {
        position: relative;
        width: 344rpx;
        height: 66rpx;
        display: flex;
        align-items: center;
        background: #fffaee;
        border-radius: 42rpx;

        &-button {
          height: 66rpx;
          font-size: 28rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1;

          &.active {
            color: #ffffff;
            font-weight: 500;
          }
        }

        &-indicator {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-left: 4rpx;
          height: 56rpx;
          position: absolute;
          background: #ffcc3c;
          border-radius: 28rpx;
          transition: transform 0.2s ease-out;
        }
      }
    }

    .content {
      position: relative;
      margin: 0rpx 28rpx;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.9),
        rgba(255, 255, 255)
      );
      border-radius: 24rpx 24rpx 0 0;

      &.personal {
        height: calc(100vh - 448rpx);
      }

      &.school {
        height: calc(100vh - 186rpx);
      }

      &-title {
        margin: 0 28rpx;
        padding: 24rpx 0 12rpx;
        height: 76rpx;
        font-size: 28rpx;
        color: #939393;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &-right {
          position: relative;
          display: flex;
          align-items: center;

          &__score {
            width: 116rpx;
            display: flex;
            justify-content: center;
            align-items: center;

            .title {
              margin-right: 4rpx;
            }
          }

          &__hot {
            display: flex;

            .title {
              margin-right: 4rpx;
            }
          }

          &__tip {
            position: absolute;
            right: 8rpx;
            bottom: 30rpx;
            width: 310rpx;

            &.score {
              right: 106rpx;
            }

            .image {
              width: 100%;
            }
          }
        }
      }

      &-list {
        width: calc(100vw - 56rpx);

        &.personal {
          height: calc(
            100vh - 448rpx - 76rpx - 118rpx - env(safe-area-inset-bottom)
          );
        }

        &.school {
          height: calc(
            100vh - 186rpx - 76rpx - 118rpx - env(safe-area-inset-bottom)
          );
        }

        &-empty {
          width: 100%;
          height: 100%;

          display: flex;
          justify-content: center;
          align-items: center;

          &-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            &__image {
              width: 304rpx;
            }

            &__text {
              margin-top: 28rpx;
              font-size: 30rpx;
              color: #939393;
              height: 42rpx;
            }
          }
        }

        &-item {
          position: relative;
          padding: 0 28rpx;
          width: 100%;
          height: 96rpx;
          display: flex;
          justify-content: space-between;
          align-items: center;

          &.placeholder {
            height: 106rpx;
          }

          &.mine {
            background: #fff6e3;
          }

          &-left {
            display: flex;
            justify-content: center;
            align-items: center;

            &__index {
              margin-right: 15rpx;
              width: 37rpx;
              font-size: 36rpx;
              color: #939393;

              &.first {
                font-family: YEFONTAoYeHei;
                color: #f7c000;
              }

              &.second {
                font-family: YEFONTAoYeHei;
                color: #d2d6ec;
              }

              &.third {
                font-family: YEFONTAoYeHei;
                color: #f2c4a9;
              }
            }

            &__user-info {
              display: flex;
              align-items: center;
              justify-content: center;

              .avatar {
                width: 64rpx;
                height: 64rpx;
                border-radius: 50%;

                .image {
                  width: 100%;
                  height: 100%;
                }
              }

              .info {
                display: flex;
                flex-direction: column;
                margin-left: 12rpx;

                .nick {
                  max-width: 300rpx;
                  height: 42rpx;
                  font-size: 30rpx;
                  color: #333333;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                }

                .school {
                  max-width: 300rpx;
                  height: 34rpx;
                  font-size: 24rpx;
                  color: #939393;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                }
              }
            }

            &__name {
              max-width: 350rpx;
              font-size: 28rpx;
              color: #333333;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            }
          }

          &-right {
            font-size: 26rpx;
            color: #333333;

            display: flex;
            align-items: center;

            &__score {
              min-width: 116rpx;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            &__hot {
              margin-right: 30rpx;
              min-width: 58rpx;
              display: flex;
              justify-content: center;
              align-items: center;

              // &.personal {
              //   margin-right: 0rpx;
              // }

              // .title {
              //   &.personal {
              //     margin-right: 16rpx;
              //     min-width: 56rpx;
              //     text-align: center;
              //   }
              // }
            }
          }
        }
      }

      &-footer {
        height: calc(env(safe-area-inset-bottom) + 118rpx);
        height: 118rpx;

        &-button-container {
          padding-bottom: 22rpx;
          height: 118rpx;

          &__button {
            margin: 0 28rpx;
            height: 96rpx;
            align-items: center;
            background: linear-gradient(225deg, #ff8c3b, #ff7b1e);
            border-radius: 48rpx;

            display: flex;
            justify-content: center;
            align-items: center;

            .text {
              margin-right: 16rpx;
              font-size: 36rpx;
              font-weight: 500;
              color: #ffffff;
            }

            .icon {
              width: 36rpx;
              height: 36rpx;
            }
          }
        }

        &-placeholder {
          height: env(safe-area-inset-bottom);
          height: 0;
        }
      }
    }
  }
}
</style>
