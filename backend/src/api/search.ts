import { Router } from 'express';
import { SearchFilters } from '../core/queryEngine';
import {SearchPostReq, SearchPostRes} from "../types/api";

const searchRouter = Router();

/**
 * POST /api/search
 * Performs a search across all indexed data.
 */
searchRouter.post<{}, SearchPostRes, SearchPostReq>('/', async (req, res) => {
    try {

        // Get the body
        const { queryEngine } = req.context;
        const { query, filters, limit } = req.body;

        // Validate input
        if (typeof query !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid "query" field.' });
        }

        const cleanFilters: SearchFilters = filters || {};
        const resultLimit: number = limit || 50;

        const results = await queryEngine.search(query, cleanFilters, resultLimit);

        res.json({
            query,
            filters: cleanFilters,
            count: results.length,
            results,
        } as SearchPostRes);
    } catch (err) {
        console.error('[API /search] Error:', err);
        res.status(500).json({ error: 'Failed to perform search.' });
    }
});

export { searchRouter };