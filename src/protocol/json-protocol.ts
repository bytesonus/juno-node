import { BaseProtocol } from './base-protocol';
import { GothamRequest, GothamResponse } from '../models/messages';

export class JsonProtocol extends BaseProtocol {
	public encode(req: GothamRequest): Buffer {
		return Buffer.from(JSON.stringify(req) + '\n');
	}

	public decode(data: Buffer): GothamResponse {
		return JSON.parse(data.toString());
	}
}
