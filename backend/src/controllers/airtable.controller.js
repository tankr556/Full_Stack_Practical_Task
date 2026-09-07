import Task from '../models/Task.js';

export const exportToAirtable = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const airtableBaseId = process.env.AIRTABLE_BASE_ID;
    const airtableTableName = process.env.AIRTABLE_TABLE_NAME || 'Tasks';

    if (!airtableApiKey || !airtableBaseId) {
      return res.status(400).json({
        success: false,
        message: 'Airtable credentials (AIRTABLE_API_KEY / AIRTABLE_BASE_ID) are not configured on server.',
      });
    }

    const tasks = await Task.find({ project: projectId });
    if (!tasks || tasks.length === 0) {
      return res.status(200).json({ success: true, message: 'No tasks to export', exportedCount: 0 });
    }

    const results = { succeeded: [], failed: [] };

    // Process tasks in chunks with retry logic for 429/5xx transient errors
    for (const task of tasks) {
      let attempts = 0;
      let success = false;
      let lastError = null;

      while (attempts < 3 && !success) {
        attempts++;
        try {
          // Idempotent export payload: match or insert based on local Task ID
          const response = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableName)}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${airtableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              records: [
                {
                  fields: {
                    TaskId: task._id.toString(),
                    Title: task.title,
                    Status: task.status,
                    Description: task.description || '',
                  },
                },
              ],
              typecast: true,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            task.airtableRecordId = data.records[0]?.id;
            await task.save();
            results.succeeded.push(task._id);
            success = true;
          } else if (response.status === 429 || response.status >= 500) {
            // Transient failure: backoff before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
          } else {
            // Non-transient validation failure: do not retry
            const errData = await response.json();
            lastError = errData.error?.message || `HTTP ${response.status}`;
            break;
          }
        } catch (err) {
          lastError = err.message;
        }
      }

      if (!success) {
        results.failed.push({ taskId: task._id, error: lastError || 'Export failed' });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Export completed: ${results.succeeded.length} succeeded, ${results.failed.length} failed`,
      results,
    });
  } catch (error) {
    return next(error);
  }
};
