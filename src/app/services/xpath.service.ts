import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class XpathService {
  constructor() { }

  public static select(evaluatorBase: XPathEvaluatorBase , expression: string, contextNode: Node): Element[] {
    let results = [];
    let iterator = evaluatorBase.evaluate(expression, contextNode);

    let result = iterator.iterateNext() as Element;
    while (result) {
      results.push(result);
      result = iterator.iterateNext() as Element;
    }

    return results;
  }

  public static select1(evaluatorBase: XPathEvaluatorBase, expression: string, contextNode: Node): Element {
    let results = [];
    let iterator = evaluatorBase.evaluate(expression, contextNode);
    return iterator.iterateNext() as Element;
  }
}
