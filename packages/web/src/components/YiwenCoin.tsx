import PlainArticle from './PlainArticle'

export default function YiwenCoin(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <PlainArticle {...props}>
      <p>
        <span>
          亿文币是平台的官方虚拟货币，单位为“<b>文</b>”，代号为
          <code>WEN</code>，用于方便用户完成平台内的支付活动。
        </span>
      </p>
      <ol>
        <li>
          <p>
            <span>
              <b>价值：</b>亿文币价值锚定港币，<b>1 HK$ = 10 WEN</b>。
            </span>
          </p>
        </li>
        <li>
          <p>
            <span>
              <b>充值：</b>用户通过充值渠道充值，充值最低额度为 50
              文，最高额度为 1,000,000 文。充值的亿文币只能用于消费。
            </span>
          </p>
        </li>
        <li>
          <p>
            <span>
              <b>奖励：</b>用户注册时，系统<b>奖励 100 文</b>
              ；用户邀请的好友注册并激活会员时，系统按每个好友<b>奖励 50 文</b>
              。奖励的亿文币只能用于消费。
            </span>
          </p>
        </li>
        <li>
          <p>
            <span>
              <b>消费：</b>
              消费活动包括支付翻译功能费用、付费阅读、打赏作品、订阅群组、红包等（部分功能待上线）。
            </span>
          </p>
        </li>
        <li>
          <p>
            <span>
              <b>提现：</b>
              读者付费阅读、打赏作品、订阅群组等支付亿文币给创作者，系统扣除服务费后，创作者获得的收益可以提现（提现功能待上线）。
            </span>
          </p>
        </li>
        <li>
          <p>
            <span>
              <b>服务费：</b>系统扣除服务费的比例为<b>30% ～ 9%</b>，最低为 1
              文，用户会员等级越高，扣除的服务费比例越低。
            </span>
          </p>
        </li>
      </ol>
    </PlainArticle>
  )
}
