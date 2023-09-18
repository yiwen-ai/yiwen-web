import { useIntl } from 'react-intl'
import PlainArticle from './PlainArticle'

export default function MembershipLevelAndCreditScore(
  props: React.HTMLAttributes<HTMLElement>
) {
  const intl = useIntl()

  return (
    <PlainArticle {...props}>
      <h3>
        {intl.formatMessage({
          defaultMessage: '基本信息',
        })}
      </h3>
      <p>
        {intl.formatMessage({
          defaultMessage:
            '信用分和会员等级是平台为鼓励用户创造价值而设立的一种激励机制，用户激活会员后，在平台消费或者创作内容获得收益时，会获得亿文币对应数量的信用分。信用分越多，会员等级越高。',
        })}
      </p>
      <ol>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '非会员：用户完成注册时，还不是会员，会员等级显示为 LV0。用户钱包中的亿文币只能用于一般消费，如支付翻译功能费用，不能用于打赏等创作收益类消费，消费时或获得收益时都不会获得信用分。',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '激活会员：用户完成首次 50 文以上的充值时，才激活会员，初始信用分为 10，会员等级显示为 LV1，用户钱包中的亿文币能用于所有类型的消费，消费时或获得收益时会获得等额信用分。',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '系统奖励：对平台做出了特殊贡献的用户，系统会奖励信用分。比如，用户发现了平台重大漏洞并及时报告，系统奖励 1000 ～ 1,000,000 个信用分。',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '会员等级：会员等级所要求的信用分计算公式为：信用分 = 10 ** 会员等级，LV2 需要 100 分，LV3 需要 1000 分，LV4 需要 10,000 分。',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '会员权益：目前不同会员等级的权益设计如下，更多荣誉和权益会随着平台发展而不断增加：',
            })}
          </p>
          <ol>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage: 'LV2 以上会员可以使用 GPT-4 模型进行翻译；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    'LV3 以上会员可以修改用户名、创建群组、调用开放 API等（相关功能待上线）；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage: 'LV4 以上会员的创作者收益服务费为 27%；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage: 'LV5 以上会员的创作者收益服务费为 24%；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage: 'LV6 以上会员的创作者收益服务费为 21%；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage: 'LV7 以上会员的创作者收益服务费为 18%；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage: 'LV8 以上会员的创作者收益服务费为 15%；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage: 'LV9 以上会员的创作者收益服务费为 12%；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage: 'LV10 以上会员的创作者收益服务费为 9%。',
                })}
              </p>
            </li>
          </ol>
        </li>
      </ol>
    </PlainArticle>
  )
}
