import { GitHubActivity } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, GitPullRequest, AlertCircle, GitCommit } from "lucide-react";

interface GithubActivityPanelProps {
  activity: GitHubActivity;
}

export const GithubActivityPanel = ({ activity }: GithubActivityPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          GitHub Activity
        </CardTitle>
        <CardDescription>Recent repository activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted rounded-lg">
            <GitCommit className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-2xl font-bold">{activity.commits}</div>
            <div className="text-xs text-muted-foreground">Commits</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <GitPullRequest className="h-5 w-5 mx-auto mb-1 text-success" />
            <div className="text-2xl font-bold">{activity.pullRequests}</div>
            <div className="text-xs text-muted-foreground">PRs</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <AlertCircle className="h-5 w-5 mx-auto mb-1 text-warning" />
            <div className="text-2xl font-bold">{activity.issues}</div>
            <div className="text-xs text-muted-foreground">Issues</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Recent Commits</h4>
          <div className="space-y-2">
            {activity.recentCommits.map((commit, index) => (
              <div key={index} className="p-2 bg-muted rounded text-sm">
                <p className="font-medium text-xs">{commit.message}</p>
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <span>{commit.author}</span>
                  <span>{commit.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Last commit: {activity.lastCommit}
        </div>
      </CardContent>
    </Card>
  );
};
