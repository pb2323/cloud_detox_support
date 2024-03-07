//
//  WebCodeBuilder+createAction.swift (Detox)
//  Created by Asaf Korem (Wix.com) on 2024.
//

/// Extends `WebCodeBuilder` with the ability to create a web action JS code.
extension WebCodeBuilder {
	func createAction(
		forAction action: WebActionType,
		params: [Any]?,
		onSelector selector: String
	) throws -> String {
		switch action {
			case .tap:
				return executeJSMethod("click", on: selector)
			case .clearText:
				return setValue("", on: selector)
			case .typeText:
				return setValue(
					try extractValueParam(action, params), on: selector, jsOperator: "+=")
			case .focus:
				return executeJSMethod("focus", on: selector)
			case .getCurrentUrl:
				return "return window.location.href;"
			case .getText:
				return getTextFromElement(selector)
			case .getTitle:
				return "return document.title;"
			case .moveCursorToEnd:
				return moveCursorToEnd(on: selector)
			case .replaceText:
				return setValue(try extractValueParam(action, params), on: selector)
			case .runScript:
				return try runScript(extractValueParam(action, params), on: selector)
			case .runScriptWithArgs:
				return try runScriptWithArgs(assertedParams(action, params, 2), on: selector)
			case .selectAllText:
				return selectAllText(on: selector)
			case .scrollToView:
				return scrollIntoView(selector)
		}
	}

	private func extractValueParam( _ action: WebActionType, _ params: [Any]?) throws -> String {
		let params = try assertedParams(action, params, 1)

		guard let value = params.first as? String else {
			throw dtx_errorForFatalError(
				"Value param for action \(action.rawValue.uppercased()) is not a string (got: \(params))"
			)
		}

		return value
	}

	private func assertedParams(_ action: WebActionType, _ params: [Any]?, _ expectedMinCount: Int) throws -> [Any] {
		guard let params = params, params.count >= expectedMinCount else {
			throw dtx_errorForFatalError(
				"Expected at-least \(expectedMinCount) params for action " +
				"\(action.rawValue.uppercased()) (got: \(params?.description ?? "none"))"
			)
		}

		return params
	}

	private func executeJSMethod(_ method: String, on element: String) -> String {
		return "\(element).\(method)();"
	}

	private func setValue(
		_ value: String, on element: String, jsOperator: String = "=") -> String {
			return """
let element = \(element);
if (element.contentEditable === 'true' ||
 (['INPUT', 'TEXTAREA'].includes(element.tagName) && !element.readOnly && !element.disabled)) {
 element.value \(jsOperator) '\(value)';
}
"""
		}

	private func moveCursorToEnd(on element: String) -> String {
		return """
let element = \(element);
let length = element.value.length;
element.setSelectionRange(length, length);
"""
	}

	private func selectAllText(on element: String) -> String {
		return """
let element = \(element);
let length = element.value.length;
element.setSelectionRange(0, length);
"""
	}

	private func scrollIntoView(_ element : String) -> String {
		return """
let element = \(element);
element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center });
"""
	}

	private func runScript(_ script: String, on elementScript: String) throws -> String {
		return "return (\(script))(\(elementScript));"
	}

	private func runScriptWithArgs(_ params: [Any], on elementScript: String) throws -> String {
		guard let script = params.first else {
			throw dtx_errorForFatalError(
				"Missing script parameter for runScript action, got: \(String(describing: params))")
		}

		let extraParamsOrNil = params.dropFirst().compactMap({ param -> String? in
			guard let data = try? JSONSerialization.data(withJSONObject: param, options: []),
						let param = String(data: data, encoding: .utf8) else {
				return nil
			}
			return param
		}).joined(separator: ",")

		let extraParams = extraParamsOrNil.isEmpty ? "" : ",...\(extraParamsOrNil)"

		return "return (\(script))(\(elementScript)\(extraParams));"
	}

	private func getTextFromElement(_ element: String) -> String {
		return """
let element = \(element);
return element.textContent.length > 0 ? element.textContent : element.value;
"""
	}
}
