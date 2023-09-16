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
            '信用分和会员等级是 Yiwen AI 平台为鼓励用户创造价值而设立的一种激励机制，用户激活会员后，在平台消费或者创作内容获得收益时，会获得亿文币对应数量的信用分。信用分只会增加不会消耗减少，只用于计算用户的会员等级。用户会员等级越高，在平台的荣誉和权益就越高，包括修改用户名、提前体验新功能、降低创作者收益服务费比例等，具体荣誉和权益会随着平台发展而不断增加。',
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
                '用户完成注册时，还不是会员，会员等级显示为 LV0。平台系统赠送的亿文币只可用于一般消费，如支付翻译功能费用，不能用于打赏等创作收益类消费，消费也不会获得信用分；',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '用户设置好敏感操作口令（又称 PIN 码），并完成首次 HK$10 以上的充值时，才激活会员，此时初始信用分为 10，会员等级显示为 LV1，平台系统赠送的亿文币可用于所有消费；',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '用户激活会员后，在平台消费或者创作内容获得收益时，会获得亿文币对应数量的信用分，具体规则如下：',
            })}
          </p>
          <ol>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '用户在平台消费时，获得消费亿文币对应数量的信用分。比如消费了 10 亿文币，即可获得 10 个信用分；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '用户创作内容获得收益时，获得收益的亿文币对应数量的信用分。比如读者打赏了 100 亿文币，该读者即可获得 100 个信用分；系统扣除服务费后，创作者获得 70% 的收益，即 70 亿文币，同时也获得 70 个信用分；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    '对平台做出了特殊贡献的用户，平台会赠送信用分。比如，用户在平台发现了重大漏洞并及时向平台报告，平台会赠送 1000 ～ 1,000,000 个信用分；',
                })}
              </p>
            </li>
          </ol>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '不同会员等级所要求的信用分计算公式为：信用分 = (10 ** (会员等级 - 1)) * 10，所以 LV2 需要 100 分，LV3 需要 1000 分，LV4 需要 10,000 分；',
            })}
          </p>
        </li>
        <li>
          <p>
            {intl.formatMessage({
              defaultMessage:
                '目前不同会员等级的权益设计如下，更多荣誉和权益会随着平台发展而不断增加：',
            })}
          </p>
          <ol>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage: 'LV2 以上会员可以使用 GPT4 模型进行翻译；',
                })}
              </p>
            </li>
            <li>
              <p>
                {intl.formatMessage({
                  defaultMessage:
                    'LV3 以上会员可以修改用户名，可以免费修改一次6位及以上的用户名，修改更多次用户名或使用更短用户名需要支付亿文币；可以创建群组；可以调用开放 API；',
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
                  defaultMessage: 'LV8 以上会员的创作者收益服务费为 15%。',
                })}
              </p>
            </li>
          </ol>
        </li>
      </ol>
    </PlainArticle>
  )
}
