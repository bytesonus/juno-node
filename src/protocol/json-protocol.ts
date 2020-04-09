import { BaseProtocol } from './base-protocol';
import { JunoRequest, JunoResponse } from '../models/messages';

export class JsonProtocol extends BaseProtocol {
	public encode(req: JunoRequest): Buffer {
		return Buffer.from(JSON.stringify(req) + '\n');
	}

	public decode(data: Buffer): JunoResponse {
		return JSON.parse(data.toString());
	}
}
