import { useIntl } from 'react-intl'
import PlainArticle from './PlainArticle'

export default function YiwenCoin(props: React.HTMLAttributes<HTMLElement>) {
  const intl = useIntl()

  return (
    <PlainArticle {...props}>
      <p>
        {intl.formatMessage({
          defaultMessage:
            '亿文币是 Yiwen AI 平台的官方虚拟货币，用于方便用户完成平台内的支付活动。用户可以用亿文币支付平台上的服务、作品费用，或给作品打赏等。亿文币不能转账，不能提现，只能用于消费。创作者通过平台创作获得的亿文币收益才能转换成亿文元，进而提现。',
        })}
      </p>
      <h3>
        {intl.formatMessage({
          defaultMessage: '详细规则',
        })}
      </h3>
      <ol>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '注册礼：用户注册时，平台系统赠送 100 文，只能用于消费；',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '邀请好友奖励：用户邀请好友注册并激活会员时，平台系统按每个好友赠送 10 文，用户每周奖励上限为 10,000 文（该活动奖励方案会定期调整），只能用于消费；',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage: '平台其它活动奖励，只能用于消费；',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '用户通过充值渠道充值，兑换比例为 HK$1 = WEN10，只能用于消费。注意：',
            })}
          </p>
          <ol>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '充值支付渠道可能会收取一定的手续费，实际到账金额会扣除该手续费，具体手续费由支付渠道决定；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '充值最低额度为 HK$10，最高额度为 HK$10,000，超过最高额度的充值，平台会拒绝接受；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '根据相关法律，亿文币属于数字化商品，不适用于无理由退款，用户充值后，不能退款。如果因为其它不得已的原因需要退款，用户需要完成实名认证并提供相关证据截图，平台会按照实际情况进行退款，并且会收取 5% 的手续费，最低手续费为 10 文；',
                })}
              </p>
            </li>
          </ol>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '用户在平台创作内容获得亿文币收益，包括付费阅读、读者打赏等，可用于消费和转换成亿文元。注意：',
            })}
          </p>
          <ol>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '读者付费阅读、打赏作品等支付的亿文币，平台系统将扣除 15% ～ 30% 的服务费，最低服务费为 1 文，创作者获得的收益为 70% ～ 85%；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '系统实际扣除的服务费比例与用户会员等级相关，用户会员等级越高，扣除的服务费比例越低。',
                })}
              </p>
            </li>
          </ol>
        </li>
      </ol>
      <h3>
        {intl.formatMessage({
          defaultMessage: '转换为亿文元进行提现',
        })}
      </h3>
      <p>
        {intl.formatMessage({
          defaultMessage:
            '亿文元是 Yiwen AI 平台的官方虚拟物品，用于方便用户将平台创作收益获得的亿文币转换为法币。亿文元不能转账，不能消费，只能用于提现或转换成亿文币消费。',
        })}
      </p>
      <ol>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '用户将平台收益获得（非充值和系统赠送）的亿文币转换成亿文元，兑换比例为 WEN10 = YW$1，最低转换值为 10 文。平台会收取 0.1% 的转换手续费，最低手续费为 1 文；',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '用户可以将亿文元换成亿文币，兑换比例为 YW$1 = WEN10，平台不会收取转换手续费；',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '用户可以将亿文元提现为法币，默认提现为港币，兑换比例为 YW$1 = HK$1，未来可支持提现为其它法币，兑换比例按照港币与其它法币的汇率计算。注意：',
            })}
          </p>
          <ol>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '用户需要完成实名认证，并绑定与实名一致的提现渠道（逐步支持支付宝、银行卡、对公账号等）；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '提现时，平台不会收取手续费，但提现渠道可能会收取一定的手续费，具体手续费由提现渠道决定；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '根据税务合规要求，平台可能会代缴代扣税费，具体税费由提现渠道收款账号所在地的税务要求决定；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '用户提现的实际到账金额为提现金额减去提现渠道收取的手续费和平台代缴代扣的税费。',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '亿文元渠道暂未开通，如需提现可联系我们进行提现（邮件）',
                })}
              </p>
            </li>
          </ol>
        </li>
      </ol>
    </PlainArticle>
  )
}
