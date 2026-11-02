import language from '@google-cloud/language';
import {googleMapping} from "./google-mapping";

import {WebCategorizer} from "../web-categorizer";
import {
  WebCategoryHelper,
  WebCategoryProviderType,
  WebCategoryResponse,
  WebCategoryResponseItem,
  WebCategoryTypesEnum
} from "@safekids-ai/web-category-types";
import * as Logger from 'abstract-logging';

class GoogleWebCategorizer extends WebCategorizer {
  client: any;
  credentials: any;
  private readonly options = {
    v2Model: {
      contentCategoriesVersion: 'V2',
    },
  };

  constructor(apiKey: string, model: string, logger?: Logger) {
    super(apiKey, model, logger);

    // google-gax 5+ takes the API key directly (the hand-built grpc
    // credentials from GoogleAuth.fromAPIKey no longer type-check).
    this.client = new language.LanguageServiceClient({apiKey});
  }

  public getProviderName(): WebCategoryProviderType {
    return WebCategoryProviderType.GOOGLE;
  }

  async categorize(text: string, url?: string): Promise<WebCategoryResponse> {
    //impose a max limit due to pricing
    const websiteText = (text.length < 1000) ? text : text.substring(0, 1000);

    try {
      const document = {
        content: websiteText,
        type: 'PLAIN_TEXT',
      };

      const [classification] = await this.client.classifyText({
        document,
        classificationModelOptions: this.options,
      });

      let result: WebCategoryResponseItem[] = []

      classification.categories.forEach(googleCategory => {
        const mappedCategories = googleMapping[googleCategory.name];
        if (mappedCategories) {
          mappedCategories.forEach(internalCategory => {
            const webCategoryType = WebCategoryHelper.getWebCategory(internalCategory);
            result.push({
              category: webCategoryType,
              probability: googleCategory.confidence
            });
          });
        }
      });

      if (!result || result.length == 0) {
        const noneCategoryResponseItem = {
          category: WebCategoryHelper.getNoneCategory(),
          probability: 1
        }
        return {
          categories: [noneCategoryResponseItem],
          rawCategory: JSON.stringify(classification.categories)
        }
      }

      return {
        categories: result,
        rawCategory: JSON.stringify(classification.categories)
      };
    } catch (error) {
      throw new Error(`Unable to categorize title ${websiteText} due to ${error}`)
    }
  }
}

export {GoogleWebCategorizer}
