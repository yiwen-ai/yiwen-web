import { useIntl } from 'react-intl'
import PlainArticle from './PlainArticle'

export default function YiwenCoin(props: React.HTMLAttributes<HTMLElement>) {
  const intl = useIntl()

  return (
    <PlainArticle {...props}>
      <p>
        {intl.formatMessage({
          defaultMessage:
            '亿文币是平台的官方虚拟货币，单位为“文”，代号为 WEN，用于方便用户完成平台内的支付活动。',
        })}
      </p>
      <ol>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage: '价值：亿文币价值锚定港币，1 HK$ = 10 WEN。',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '充值：用户通过充值渠道充值，充值最低额度为 50 文，最高额度为 1,000,000 文。充值的亿文币只能用于消费。',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '奖励：用户注册时，系统赠送 100 文；用户邀请的好友注册并激活会员时，系统按每个好友赠送 50 文。奖励的亿文币只能用于消费。',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '消费：消费活动包括支付翻译功能费用、付费阅读、打赏作品、订阅群组、红包等（部分功能待上线）。',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '提现：读者付费阅读、打赏作品、订阅群组等支付亿文币给创作者，系统扣除服务费后，创作者获得的收益可以提现（提现功能待上线）。',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '服务费：系统扣除服务费的比例为 30% ～ 9%，最低为 1 文，用户会员等级越高，扣除的服务费比例越低。',
            })}
          </p>
        </li>
      </ol>
    </PlainArticle>
  )
}
